import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Announcement, User } from '../models';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  constructor(private dataService: DataService) {}

  getAnnouncements(): Observable<Announcement[]> {
    return this.dataService.getAnnouncements();
  }

  publishAnnouncement(
    publisher: User,
    data: {
      title: string;
      content: string;
      priority: Announcement['priority'];
      pinned: boolean;
      targetAudience: Announcement['targetAudience'];
    }
  ): Announcement {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: data.title,
      content: data.content,
      priority: data.priority,
      publishedBy: publisher.id,
      publishedByName: publisher.name,
      publishedAt: new Date().toISOString(),
      pinned: data.pinned,
      targetAudience: data.targetAudience
    };

    this.dataService.saveAnnouncement(newAnn);

    // Audit log
    this.dataService.logAction({
      actorId: publisher.id,
      actorName: publisher.name,
      action: 'PUBLISHED_ANNOUNCEMENT',
      targetEntity: 'Announcement',
      targetId: newAnn.id,
      details: `Published announcement "${data.title}" (Priority: ${data.priority})`
    });

    // Broadcast notification to all employees
    this.dataService.addNotification({
      id: `notif-${Date.now()}`,
      recipientId: 'all',
      senderName: publisher.name,
      title: `Studio Announcement: ${data.title}`,
      message: data.content.length > 90 ? data.content.substring(0, 90) + '...' : data.content,
      type: 'announcement',
      link: '/announcements',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return newAnn;
  }

  deleteAnnouncement(id: string): void {
    this.dataService.deleteAnnouncement(id);
  }
}
