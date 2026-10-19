import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";

export async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    if (!notifications.length) {
      const audit = await AuditLog.find({ actor: req.user._id }).sort({ createdAt: -1 }).limit(5);
      return res.json({ notifications: audit.map(item => ({ _id: item._id, message: item.action, type: "system", href: "/dashboard", readAt: item.createdAt, createdAt: item.createdAt })), unreadCount: 0 });
    }
    res.json({ notifications, unreadCount: notifications.filter(n => !n.readAt).length });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { readAt: new Date() }, { new: true });
    if (!notification) throw Object.assign(new Error("Notification not found"), { status: 404 });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany({ user: req.user._id, readAt: null }, { readAt: new Date() });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}