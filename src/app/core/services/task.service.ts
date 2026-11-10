import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TaskItem, TaskPriority, TaskStatus, User } from '../models';
import { DataService } from './data.service';
import { getTodayDateString } from './mock-data';

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
      createdDate: getTodayDateString(),
      dueDate: data.dueDate,
      estimatedHours: data.estimatedHours,
      actualHours: 0,
      priority: data.priority,
      status: 'Pending',
      completionPercentage: 0,
      referenceUrl: data.referenceUrl,
      timerRunning: false
    };

    this.dataService.saveTask(newTask);

    // Notify assigned employee if created by someone else
    if (creator.id !== data.assignedTo) {
      this.dataService.addNotification({
        id: `notif-${Date.now()}`,
        recipientId: data.assignedTo,
        senderName: creator.name,
        title: 'New Creative Task Assigned',
        message: `You were assigned to "${data.title}" (${data.projectName}). Due: ${data.dueDate}`,
        type: 'task',
        link: '/tasks',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return newTask;
  }

  updateTask(taskId: string, partial: Partial<TaskItem>): TaskItem {
    const tasks = this.dataService.getTasksSnapshot();
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found.');

    const updated: TaskItem = {
      ...task,
      ...partial
    };

    // If status changed to Completed, ensure completion is 100%
    if (partial.status === 'Completed' && task.status !== 'Completed') {
      updated.completionPercentage = 100;
      if (updated.timerRunning) {
        this.stopTimer(task.id);
      }
      // Notify HR
      this.dataService.addNotification({
        id: `notif-${Date.now()}`,
        recipientId: 'user-admin',
        senderName: task.assignedToName,
        title: 'Task Completed',
        message: `${task.assignedToName} completed "${task.title}".`,
        type: 'task',
        link: '/tasks',
        isRead: false,
        createdAt: new Date().toISOString()
      });
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
      status: task.status === 'Pending' ? 'In Progress' : task.status,
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
    const today = getTodayDateString();

    const todayTasks = tasks.filter(t => t.dueDate === today && t.status !== 'Completed');
    const overdueTasks = tasks.filter(t => t.dueDate < today && t.status !== 'Completed');
    const upcomingTasks = tasks.filter(t => t.dueDate > today && t.status !== 'Completed');
    const completedTasks = tasks.filter(t => t.status === 'Completed');

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
      totalEst: Math.round(totalEst * 10) / 10,
      totalAct: Math.round(totalAct * 10) / 10,
      completionRate
    };
  }
}
