const { PushSubscription, User } = require('../models');
const webpush = require('web-push');
const { Op } = require('sequelize');

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Get VAPID public key
exports.getVapidPublicKey = (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

// Subscribe to push notifications
exports.subscribe = async (req, res) => {
  try {
    const { endpoint, keys, browser, os } = req.body;

    if (!endpoint || !keys) {
      return res.status(400).json({ error: 'Endpoint and keys are required' });
    }

    // Check if subscription exists
    let subscription = await PushSubscription.findOne({
      where: { endpoint, user_id: req.user.id },
    });

    if (subscription) {
      subscription.keys = keys;
      subscription.browser = browser;
      subscription.os = os;
      subscription.is_active = true;
      subscription.last_used = new Date();
      await subscription.save();
    } else {
      subscription = await PushSubscription.create({
        user_id: req.user.id,
        endpoint,
        keys,
        browser,
        os,
        is_active: true,
      });
    }

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

// Unsubscribe from push notifications
exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    const subscription = await PushSubscription.findOne({
      where: { endpoint, user_id: req.user.id },
    });

    if (subscription) {
      subscription.is_active = false;
      await subscription.save();
    }

    res.json({ success: true, message: 'Unsubscribed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
};

// Send push notification to user
exports.sendToUser = async (req, res) => {
  try {
    const { user_id, title, body, url } = req.body;

    const subscriptions = await PushSubscription.findAll({
      where: { user_id, is_active: true },
    });

    if (subscriptions.length === 0) {
      return res.status(404).json({ error: 'No active subscriptions found' });
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      timestamp: new Date().toISOString(),
    });

    const results = [];
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload
        );
        results.push({ success: true, endpoint: subscription.endpoint });
      } catch (error) {
        console.error('Push error:', error.message);
        if (error.statusCode === 410) {
          // Subscription expired
          subscription.is_active = false;
          await subscription.save();
        }
        results.push({ success: false, endpoint: subscription.endpoint, error: error.message });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Send push error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

// Send push notification to all users
exports.sendToAll = async (req, res) => {
  try {
    const { title, body, url } = req.body;

    const subscriptions = await PushSubscription.findAll({
      where: { is_active: true },
    });

    if (subscriptions.length === 0) {
      return res.status(404).json({ error: 'No active subscriptions found' });
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      timestamp: new Date().toISOString(),
    });

    let successCount = 0;
    let failCount = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload
        );
        successCount++;
      } catch (error) {
        failCount++;
        if (error.statusCode === 410) {
          subscription.is_active = false;
          await subscription.save();
        }
      }
    }

    res.json({
      success: true,
      sent: successCount,
      failed: failCount,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Send to all error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
};

// Get user subscriptions
exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await PushSubscription.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'endpoint', 'browser', 'os', 'is_active', 'last_used'],
    });

    res.json({ success: true, subscriptions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
};

// Get all subscriptions (admin)
exports.getAllSubscriptions = async (req, res) => {
  try {
    const { is_active, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const subscriptions = await PushSubscription.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'phone'],
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['last_used', 'DESC']],
    });

    res.json({ success: true, ...subscriptions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
};
