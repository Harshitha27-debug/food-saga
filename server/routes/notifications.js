const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { getIsConnected } = require('../config/db');
const { protect } = require('../middleware/auth');
const { mockNotifications } = require('../utils/mockData');

// Local mock list for demo mode
let localNotifications = [...mockNotifications];

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (getIsConnected()) {
      const list = await Notification.find({ userId: req.user.id }).sort('-createdAt');
      return res.json({ success: true, data: list });
    } else {
      // Mock mode
      const list = localNotifications.filter(n => n.userId === req.user.id);
      return res.json({ success: true, data: list });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    if (getIsConnected()) {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { isRead: true },
        { new: true }
      );
      if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
      return res.json({ success: true, data: notification });
    } else {
      // Mock mode
      const notification = localNotifications.find(n => n._id === req.params.id && n.userId === req.user.id);
      if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

      notification.isRead = true;
      return res.json({ success: true, data: notification });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/notifications
// @desc    Create a system notification
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, message, type } = req.body;

  try {
    if (getIsConnected()) {
      const notification = await Notification.create({
        userId: req.user.id,
        title,
        message,
        type: type || 'system'
      });
      return res.status(201).json({ success: true, data: notification });
    } else {
      const newNotification = {
        _id: 'not_' + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        title,
        message,
        type: type || 'system',
        isRead: false,
        createdAt: new Date()
      };
      localNotifications.push(newNotification);
      return res.status(201).json({ success: true, data: newNotification });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.localNotifications = localNotifications;
