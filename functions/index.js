const functions = require('firebase-functions/v2');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

/**
 * 1. Secure Server-Side Notification Dispatcher
 * Sends FCM push notification to specific user devices
 */
async function sendPushToUser(userId, payload) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;

    const fcmTokens = userDoc.data().fcmTokens || [];
    if (fcmTokens.length === 0) return;

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      tokens: fcmTokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`Push sent to user ${userId}: ${response.successCount} success`);
  } catch (error) {
    console.error(`Error sending push to user ${userId}:`, error);
  }
}

/**
 * 2. On Leave Request Submitted: Notify HR Admins
 */
exports.onLeaveRequestCreated = onDocumentCreated('leaves/{leaveId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;
  const leaveData = snapshot.data();

  // Find all HR/Admin users
  const adminUsersSnap = await db.collection('users').where('role', '==', 'admin').get();

  for (const doc of adminUsersSnap.docs) {
    // Add in-app notification doc
    await db.collection('notifications').add({
      recipientId: doc.id,
      senderName: leaveData.employeeName,
      title: 'New Leave Request',
      message: `${leaveData.employeeName} submitted a ${leaveData.leaveType} (${leaveData.startDate} to ${leaveData.endDate}).`,
      type: 'leave',
      link: '/leave',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Send Push Notification
    await sendPushToUser(doc.id, {
      title: 'Studio Leave Request',
      body: `${leaveData.employeeName} requested ${leaveData.daysCount} days leave.`,
      data: { url: '/leave' },
    });
  }
});

/**
 * 3. On Leave Request Reviewed (Approved / Rejected): Notify Employee
 */
exports.onLeaveStatusChanged = onDocumentUpdated('leaves/{leaveId}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (before.status === after.status) return;

  if (after.status === 'Approved' || after.status === 'Rejected') {
    // If approved, deduct leave balance
    if (after.status === 'Approved') {
      const userRef = db.collection('users').doc(after.userId);
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (userDoc.exists) {
          const balances = userDoc.data().leaveBalances || { casual: 12, sick: 10, emergency: 5, total: 27 };
          if (after.leaveType.includes('Casual') || after.leaveType.includes('Full Day')) {
            balances.casual = Math.max(0, balances.casual - after.daysCount);
          } else if (after.leaveType.includes('Sick')) {
            balances.sick = Math.max(0, balances.sick - after.daysCount);
          } else if (after.leaveType.includes('Emergency')) {
            balances.emergency = Math.max(0, balances.emergency - after.daysCount);
          }
          balances.total = Math.max(0, balances.total - after.daysCount);
          transaction.update(userRef, { leaveBalances: balances });
        }
      });
    }

    // Add In-App notification
    await db.collection('notifications').add({
      recipientId: after.userId,
      senderName: after.reviewedBy || 'Studio HR',
      title: `Leave Request ${after.status}`,
      message: `Your ${after.leaveType} for ${after.startDate} has been ${after.status.toLowerCase()}.`,
      type: 'leave',
      link: '/leave',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Send push notification
    await sendPushToUser(after.userId, {
      title: `Leave ${after.status}`,
      body: `Your leave starting ${after.startDate} was ${after.status.toLowerCase()} by HR.`,
      data: { url: '/leave' },
    });
  }
});

/**
 * 4. On Task Assigned: Notify Assigned Creative
 */
exports.onTaskAssigned = onDocumentCreated('tasks/{taskId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;
  const task = snapshot.data();

  if (!task.assignedTo || task.assignedTo === task.createdBy) return;

  await db.collection('notifications').add({
    recipientId: task.assignedTo,
    senderName: task.createdByName || 'Studio Director',
    title: 'New Creative Task Assigned',
    message: `You were assigned to "${task.title}" (${task.projectName}). Due: ${task.dueDate}`,
    type: 'task',
    link: '/tasks',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  await sendPushToUser(task.assignedTo, {
    title: 'New Creative Assignment',
    body: `Task "${task.title}" assigned to you. Due ${task.dueDate}.`,
    data: { url: '/tasks' },
  });
});

/**
 * 5. Daily Attendance Cutoff Scheduled Checker
 * Runs daily at 10:35 AM to check who hasn't checked in yet.
 * Does not automatically mark absent before cutoff!
 */
exports.dailyAttendanceCutoffCheck = onSchedule('35 10 * * 1-5', async () => {
  const today = new Date().toISOString().split('T')[0];

  // Get all active employees (non-admin)
  const activeEmployeesSnap = await db.collection('users')
    .where('status', '==', 'active')
    .where('role', '==', 'employee')
    .get();

  const todayAttendanceSnap = await db.collection('attendance')
    .where('date', '==', today)
    .get();

  const checkedInUserIds = new Set(todayAttendanceSnap.docs.map(d => d.data().userId));

  // Get approved leaves for today
  const leavesSnap = await db.collection('leaves')
    .where('status', '==', 'Approved')
    .get();

  const onLeaveUserIds = new Set(
    leavesSnap.docs
      .map(d => d.data())
      .filter(l => today >= l.startDate && today <= l.endDate)
      .map(l => l.userId)
  );

  const missingEmployees = [];
  activeEmployeesSnap.forEach(doc => {
    const userId = doc.id;
    if (!checkedInUserIds.has(userId) && !onLeaveUserIds.has(userId)) {
      missingEmployees.push({ id: userId, name: doc.data().name });
    }
  });

  if (missingEmployees.length > 0) {
    const adminSnap = await db.collection('users').where('role', '==', 'admin').get();
    for (const adminDoc of adminSnap.docs) {
      await db.collection('notifications').add({
        recipientId: adminDoc.id,
        title: 'Morning Cutoff: Missing Check-Ins',
        message: `${missingEmployees.length} creative(s) have not clocked in past 10:30 AM cutoff: ${missingEmployees.map(m => m.name).join(', ')}.`,
        type: 'attendance',
        link: '/attendance',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }
});
