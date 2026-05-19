// ═══ PUSH NOTIFICATIONS & REMINDERS ═══
// Paste this at the top of App.jsx after imports

export const Notif = {
  // Request permission
  async requestPermission() {
    if (!('Notification' in window)) return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  },

  // Show local notification immediately
  show(title, body, options = {}) {
    if (Notification.permission !== 'granted') return;
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    });
  },

  // Schedule reminder for event (uses setTimeout for same session,
  // or store in localStorage for next visit)
  scheduleReminder(ev, minutesBefore = 60) {
    const evTime = new Date(ev.date + 'T' + (ev.time || '09:00'));
    const remindAt = new Date(evTime.getTime() - minutesBefore * 60 * 1000);
    const now = new Date();
    const delay = remindAt - now;

    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      // Within 24h: use setTimeout
      setTimeout(() => {
        Notif.show(
          `Erinnerung: ${ev.title}`,
          `In ${minutesBefore} Minuten · ${ev.location || ''}`,
          { tag: ev.id }
        );
      }, delay);
    }

    // Always store in localStorage for next app open
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const existing = reminders.find(r => r.evId === ev.id);
    if (!existing) {
      reminders.push({
        evId: ev.id,
        title: ev.title,
        remindAt: remindAt.toISOString(),
        minutesBefore
      });
      localStorage.setItem('reminders', JSON.stringify(reminders));
    }
  },

  // Check stored reminders on app open
  checkStored() {
    if (Notification.permission !== 'granted') return;
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const now = new Date();
    const due = reminders.filter(r => new Date(r.remindAt) <= now);
    due.forEach(r => {
      Notif.show(`Erinnerung: ${r.title}`, 'Termin steht bald an!', { tag: r.evId });
    });
    // Remove fired reminders
    const remaining = reminders.filter(r => new Date(r.remindAt) > now);
    localStorage.setItem('reminders', JSON.stringify(remaining));
  }
};
