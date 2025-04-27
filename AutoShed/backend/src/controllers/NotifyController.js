import Notification from "../models/Notify.js"; // Assuming you have a Notification model defined in models/Notify.js

// Get all notifications (admin view)
export async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get notifications by audience (for public/specific audience)
export async function getNotificationsByAudience(req, res) {
  try {
    const { audience } = req.params;
    const notifications = await Notification.findActiveNotifications(audience);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get active notifications for homepage
export async function getActiveCommonNotifications(req, res) {
  try {
    const notifications = await Notification.findActiveNotifications("common");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get single notification
export async function getNotificationById(req, res) {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Increment view count
    await notification.incrementViewCount();
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Create notification
export async function addNotification(req, res) {
  try {
    const notification = new Notification({
      ...req.body,
      createdBy: req.user?._id // Assuming auth middleware attaches user
    });
    
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Update notification
export async function updateNotification(req, res) {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    Object.assign(notification, req.body);
    notification.lastModifiedBy = req.user?._id;
    
    const updatedNotification = await notification.save();
    res.json(updatedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete notification
export async function deleteNotification(req, res) {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    await notification.deleteOne();
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Bulk delete notifications
export async function bulkDeleteNotifications(req, res) {
  try {
    const { ids } = req.body;
    await Notification.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Notifications deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get notification statistics
export async function getNotificationStats(req, res) {
  try {
    const currentDate = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);

    const [total, active, expiringSoon, byType] = await Promise.all([
      Notification.countDocuments(),
      Notification.countDocuments({
        status: "Published",
        effectiveDate: { $lte: currentDate },
        expirationDate: { $gt: currentDate }
      }),
      Notification.countDocuments({
        status: "Published",
        expirationDate: { $gte: currentDate, $lte: oneWeekLater }
      }),
      Notification.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 }, totalViews: { $sum: "$viewCount" } } }
      ])
    ]);

    res.json({
      totalNotifications: total,
      activeNotifications: active,
      expiringThisWeek: expiringSoon,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = { count: item.count, views: item.totalViews };
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
