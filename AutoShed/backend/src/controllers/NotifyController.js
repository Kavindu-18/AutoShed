// src/controllers/NotifyController.js - UPDATED
import Notification from "../models/Notify.js";
import Student from "../models/Student.js";
import Examiner from "../models/Examiner.js";
import { sendBulkEmails } from "../services/emailService.js"; // Fixed import

// IMPORTANT: Keep all your existing controller methods
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

export async function getNotificationsByAudience(req, res) {
  try {
    const { audience } = req.params;
    const notifications = await Notification.findActiveNotifications(audience);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getActiveCommonNotifications(req, res) {
  try {
    const notifications = await Notification.findActiveNotifications("common");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

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

export async function addNotification(req, res) {
  try {
    const notification = new Notification({
      ...req.body,
      createdBy: req.user?._id // Assuming auth middleware attaches user
    });
    
    const savedNotification = await notification.save();
    
    // Send emails if notification is published and email notification is enabled
    if (savedNotification.status === 'Published' && savedNotification.notifyViaEmail) {
      sendEmailsForNotification(savedNotification._id);
    }
    
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function updateNotification(req, res) {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Save previous state to check if notification was just published
    const wasPublished = notification.status === 'Published';
    const hadEmailEnabled = notification.notifyViaEmail;
    
    Object.assign(notification, req.body);
    notification.lastModifiedBy = req.user?._id;
    
    const updatedNotification = await notification.save();
    
    // Send emails if notification is now published with email notifications enabled
    if (updatedNotification.status === 'Published' && 
        updatedNotification.notifyViaEmail && 
        (!wasPublished || !hadEmailEnabled)) {
      sendEmailsForNotification(updatedNotification._id);
    }
    
    res.json(updatedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

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

export async function bulkDeleteNotifications(req, res) {
  try {
    const { ids } = req.body;
    await Notification.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Notifications deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

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

// ADD NEW EMAIL FUNCTIONALITY
// Manual email sending endpoint
export async function sendNotificationEmails(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Get recipients based on audience
    const recipients = await getEmailRecipients(notification.targetAudience);
    
    if (recipients.length === 0) {
      return res.status(400).json({ message: "No recipients found for the selected audience" });
    }
    
    // Send email
    const result = await sendBulkEmails(
      recipients,
      `Notification: ${notification.title}`,
      generateEmailContent(notification)
    );
    
    if (result.success) {
      res.json({ message: "Emails sent successfully", recipientCount: recipients.length });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Email sending error:", error);
    console.error(error.stack);
    res.status(500).json({ message: "Failed to send emails", error: error.message });
  }
}

// Helper function for sending emails in the background
async function sendEmailsForNotification(notificationId) {
  try {
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return;
    }
    
    const recipients = await getEmailRecipients(notification.targetAudience);
    
    if (recipients.length === 0) {
      console.log("No recipients found for notification", notificationId);
      return;
    }
    
    const result = await sendBulkEmails(
      recipients,
      `Notification: ${notification.title}`,
      generateEmailContent(notification)
    );
    
    if (result.success) {
      console.log(`Successfully sent notification emails to ${recipients.length} recipients`);
    } else {
      console.error("Email sending failed:", result.error);
    }
  } catch (error) {
    console.error("Background email sending error:", error);
  }
}

// Helper function: Get email recipients based on audience
async function getEmailRecipients(targetAudience) {
  try {
    let recipients = [];
    // Normalize targetAudience to array
    const audiences = Array.isArray(targetAudience) ? targetAudience : [targetAudience];
    
    if (audiences.includes('common')) {
      // Get all student and examiner emails
      const students = await Student.find({}, 'email');
      const examiners = await Examiner.find({}, 'email');
      recipients = [
        ...recipients,
        ...students.map(s => s.email),
        ...examiners.map(e => e.email)
      ];
    }
    if (audiences.includes('students')) {
      // Get only student emails
      const students = await Student.find({}, 'email');
      recipients = [...recipients, ...students.map(s => s.email)];
    }
    if (audiences.includes('examiners')) {
      // Get only examiner emails
      const examiners = await Examiner.find({}, 'email');
      recipients = [...recipients, ...examiners.map(e => e.email)];
    }
    
    // Remove duplicates and filter out any empty emails
    recipients = [...new Set(recipients)].filter(email => email);
    return recipients;
  } catch (error) {
    console.error("Error getting email recipients:", error);
    return [];
  }
}

// Helper function: Generate email HTML content
function generateEmailContent(notification) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #f5f5f5; padding: 10px; border-radius: 5px 5px 0 0; border-bottom: 2px solid #ddd; }
        .content { padding: 20px 0; }
        .footer { font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; }
        .priority-high { color: #d32f2f; font-weight: bold; }
        .priority-medium { color: #f57c00; font-weight: bold; }
        .priority-low { color: #388e3c; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">${notification.title}</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">
            <span class="priority-${notification.priority.toLowerCase()}">${notification.priority} Priority</span> | 
            ${notification.type}
          </p>
        </div>
        <div class="content">
          ${notification.body.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
          <p>This notification is active from ${new Date(notification.effectiveDate).toLocaleDateString()} 
             to ${new Date(notification.expirationDate).toLocaleDateString()}</p>
          <p>Please do not reply to this email, it was sent automatically by the system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}