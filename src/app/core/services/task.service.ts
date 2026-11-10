import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TaskItem, TaskPriority, TaskStatus, User } from '../models';
import { DataService } from './data.service';
import { getTodayDateStringIST } from './ist-date.utils';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private dataService: DataService) {}

  getAllTasks(): Observable<TaskItem[]> {
    return this.dataService.getTasks();
  }

  getUserTasks(userId: string): Observable<TaskItem[]> {
    return this.dataService.getTasks().pipe(
      map(tasks => tasks.filter(t => t.assignedTo === userId))
    );
  }

  createTask(
    creator: User,
    data: {
      title: string;
      projectName: string;
      description: string;
      assignedTo: string;
      assignedToName: string;
      assignedToAvatar: string;
      dueDate: string;
      estimatedHours: number;
      priority: TaskPriority;
      referenceUrl?: string;
    }
  ): TaskItem {
    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: data.title,
      projectName: data.projectName,
      description: data.description,
      assignedTo: data.assignedTo,
      assignedToName: data.assignedToName,
      assignedToAvatar: data.assignedToAvatar,
      createdBy: creator.id,
      createdByName: creator.name,
      createdDate: getTodayDateStringIST(),
      dueDate: data.dueDate,
      estimatedHours: data.estimatedHours,
      actualHours: 0,
      priority: data.priority,
      status: 'Not Started',
      completionPercentage: 0,
      referenceUrl: data.referenceUrl,
      timerRunning: false
    };

    this.dataService.saveTask(newTask);

    if (creator.id !== data.assignedTo) {
      this.dataService.addNotification({
        id: `notif-${Date.now()}`,
        recipientId: data.assignedTo,
        senderName: creator.name,
        title: 'New Creative Task Assigned',
        message: `You were assigned to "${data.title}" by ${creator.name}. Due: ${data.dueDate}`,
        type: 'task',
        link: '/tasks',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return newTask;
  }

  /**
   * Simplified 3-State Clickable Button Action:
   * [ Not Started ]  [ In Progress ]  [ Completed ]
   * Checks employee ownership & saves completion timestamp automatically.
   */
  setTaskStatus(taskId: string, status: 'Not Started' | 'In Progress' | 'Completed', user: User): TaskItem {
    const tasks = this.dataService.getTasksSnapshot();
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found.');

    // Employees can only update tasks assigned to them
    const isHostOrHr = user.role === 'super_admin' || user.role === 'hr_admin' || user.role === 'admin';
    if (!isHostOrHr && task.assignedTo !== user.id) {
      throw new Error('Permission denied: You can only update tasks assigned to you.');
    }

    const nowIso = new Date().toISOString();
    let percentage = task.completionPercentage;
    let completedAt = task.completedAt;

    if (status === 'Completed') {
      percentage = 100;
      completedAt = nowIso;
      if (task.timerRunning) {
        this.stopTimer(task.id);
      }
      this.dataService.addNotification({
        id: `notif-${Date.now()}`,
        recipientId: 'all',
        senderName: user.name,
        title: 'Task Completed',
        message: `${user.name} marked "${task.title}" as Completed.`,
        type: 'task',
        link: '/tasks',
        isRead: false,
        createdAt: nowIso
      });
    } else if (status === 'In Progress') {
      percentage = percentage === 0 ? 30 : (percentage === 100 ? 70 : percentage);
      completedAt = undefined;
    } else if (status === 'Not Started') {
      percentage = 0;
      completedAt = undefined;
      if (task.timerRunning) {
        this.stopTimer(task.id);
      }
    }

    const updated: TaskItem = {
      ...task,
      status: status,
      completionPercentage: percentage,
      completedAt: completedAt
    };

    this.dataService.saveTask(updated);
    return updated;
  }

  updateTask(taskId: string, partial: Partial<TaskItem>): TaskItem {
    const tasks = this.dataService.getTasksSnapshot();
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found.');

    const updated: TaskItem = {
      ...task,
      ...partial
    };

    if (partial.status === 'Completed' && task.status !== 'Completed') {
      updated.completionPercentage = 100;
      updated.completedAt = new Date().toISOString();
      if (updated.timerRunning) {
        this.stopTimer(task.id);
      }
    }

    this.dataService.saveTask(updated);
    return updated;
  }

  startTimer(taskId: string): void {
    const tasks = this.dataService.getTasksSnapshot();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Pause any other running task for this user
    tasks.forEach(t => {
      if (t.assignedTo === task.assignedTo && t.id !== taskId && t.timerRunning) {
        this.pauseTimer(t.id);
      }
    });

    const updated: TaskItem = {
      ...task,
      status: task.status === 'Not Started' ? 'In Progress' : task.status,
      timerRunning: true,
      timerStartedAt: new Date().toISOString()
    };
    this.dataService.saveTask(updated);
  }

  pauseTimer(taskId: string): void {
    const tasks = this.dataService.getTasksSnapshot();
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.timerRunning || !task.timerStartedAt) return;

    const start = new Date(task.timerStartedAt).getTime();
    const now = Date.now();
    const elapsedHours = (now - start) / (1000 * 60 * 60);
    const newActual = Math.round((task.actualHours + elapsedHours) * 10) / 10;

    const updated: TaskItem = {
      ...task,
      actualHours: newActual,
      timerRunning: false,
      timerStartedAt: undefined
    };
    this.dataService.saveTask(updated);
  }

  stopTimer(taskId: string): void {
    this.pauseTimer(taskId);
  }

  deleteTask(taskId: string): void {
    this.dataService.deleteTask(taskId);
  }

  categorizeTasks(tasks: TaskItem[]) {
    const today = getTodayDateStringIST();

    const todayTasks = tasks.filter(t => t.dueDate === today && t.status !== 'Completed');
    const overdueTasks = tasks.filter(t => t.dueDate < today && t.status !== 'Completed');
    const upcomingTasks = tasks.filter(t => t.dueDate > today && t.status !== 'Completed');
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    const notStartedTasks = tasks.filter(t => t.status === 'Not Started' || t.status === 'Pending');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');

    const totalEst = tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
    const totalAct = tasks.reduce((acc, t) => acc + (t.actualHours || 0), 0);
    const completionRate = tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

    return {
      todayTasks,
      overdueTasks,
      upcomingTasks,
      completedTasks,
      notStartedTasks,
      inProgressTasks,
      totalEst: Math.round(totalEst * 10) / 10,
      totalAct: Math.round(totalAct * 10) / 10,
      completionRate
    };
  }
}
