/**
 * Web Notification Service for Desktop & Mobile Devices (PWA)
 * Features exact-millisecond alarm scheduling, 5-minute advance warnings,
 * deduplication keys, and Service Worker integration for mobile & desktop.
 */

export interface NotificationOptions {
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  vibrate?: number[];
  data?: any;
}

const notifiedKeys = new Set<string>();
const activeTimeouts = new Map<string, number>();

const recentNotificationHashes = new Map<string, number>();

export class NotificationService {
  static isSupported(): boolean {
    return 'Notification' in window;
  }

  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('[SYSTEM NOTIFICATION] Web Notifications not supported on this browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.sendNotification(
          'SYSTEM PROTOCOL LINKED',
          'Exact time notifications activated for your daily schedule.',
          'info'
        );
        return true;
      }
      return false;
    } catch (e) {
      console.error('[SYSTEM NOTIFICATION] Error requesting notification permission:', e);
      return false;
    }
  }

  static async sendNotification(
    title: string,
    body: string,
    type: 'warning' | 'penalty' | 'level_up' | 'rank_change' | 'info' = 'info'
  ): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    // Deduplicate: Don't resend identical notification within 15 seconds
    const notifHash = `${title.trim()}:${body.trim()}`;
    const nowMs = Date.now();
    const lastSent = recentNotificationHashes.get(notifHash);
    if (lastSent && nowMs - lastSent < 15000) {
      return;
    }
    recentNotificationHashes.set(notifHash, nowMs);

    const systemTitle = `[SYSTEM PROTOCOL] ${title}`;
    const options: NotificationOptions = {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: `system-${notifHash.replace(/[^a-zA-Z0-9]/g, '_')}`,
      vibrate: type === 'penalty' ? [400, 150, 400] : [150, 100, 150],
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.active) {
          await registration.showNotification(systemTitle, options as any);
          return;
        }
      }

      new Notification(systemTitle, options);
    } catch (e) {
      console.error('[SYSTEM NOTIFICATION] Failed to dispatch native notification:', e);
      try {
        new Notification(systemTitle, options);
      } catch (err) {
        // ignore fallback errors
      }
    }
  }

  /**
   * Schedule exact millisecond alarms & 5-minute pre-warnings for tasks with time slots
   */
  static scheduleTimeSlotCheck(tasks: any[]) {
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    tasks.forEach((task) => {
      if (task.timeSlot && task.active) {
        const parts = task.timeSlot.split('-');
        const startTimeStr = parts[0]?.trim();
        if (!startTimeStr) return;

        const [startHours, startMins] = startTimeStr.split(':').map(Number);
        if (isNaN(startHours) || isNaN(startMins)) return;

        // Construct target Date for today
        const targetDate = new Date(now);
        targetDate.setHours(startHours, startMins, 0, 0);

        const msUntilStart = targetDate.getTime() - now.getTime();
        const startKey = `${todayStr}-${task.id}-start`;

        // 1. Exact Start Time Trigger
        if (msUntilStart > 0 && msUntilStart <= 24 * 3600 * 1000) {
          if (!activeTimeouts.has(startKey)) {
            const timeoutId = window.setTimeout(() => {
              if (!notifiedKeys.has(startKey)) {
                notifiedKeys.add(startKey);
                this.sendNotification(
                  `START NOW: ${task.title}`,
                  `Scheduled time block (${task.timeSlot}) is commencing now. Target: ${task.target}.`,
                  'warning'
                );
              }
              activeTimeouts.delete(startKey);
            }, msUntilStart);

            activeTimeouts.set(startKey, timeoutId);
          }
        }

        // 2. 5-Minute Warning Trigger
        const warningDate = new Date(targetDate.getTime() - 5 * 60 * 1000);
        const msUntilWarning = warningDate.getTime() - now.getTime();
        const warningKey = `${todayStr}-${task.id}-warning-5m`;

        if (msUntilWarning > 0 && msUntilWarning <= 24 * 3600 * 1000) {
          if (!activeTimeouts.has(warningKey)) {
            const timeoutId = window.setTimeout(() => {
              if (!notifiedKeys.has(warningKey)) {
                notifiedKeys.add(warningKey);
                this.sendNotification(
                  `UPCOMING IN 5 MINS: ${task.title}`,
                  `Prepare for scheduled block (${task.timeSlot}). Target: ${task.target}.`,
                  'info'
                );
              }
              activeTimeouts.delete(warningKey);
            }, msUntilWarning);

            activeTimeouts.set(warningKey, timeoutId);
          }
        }
      }
    });
  }
}
