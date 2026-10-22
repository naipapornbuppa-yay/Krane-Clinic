/* pages/notifications/page.js: page-owned behavior; shared state and router remain central. */

// Matched branch returns true when it consumes the original delegated event.
function kraneHandle_notifications_markRead(e, markRead) {
      document.querySelectorAll('#notifications .notif--unread').forEach(n => n.classList.remove('notif--unread'));
      markRead.textContent = 'อ่านทั้งหมดแล้ว';
      markRead.disabled = true;
      showActionToast('อ่านการแจ้งเตือนทั้งหมดแล้ว');
      return true;

  return false;
}
