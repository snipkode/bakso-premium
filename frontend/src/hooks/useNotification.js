import { useEffect, useCallback, useState } from 'react';
import api from '@/lib/api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Get existing subscription
      getExistingSubscription();
    }
  }, []);

  // Get existing subscription from backend
  const getExistingSubscription = async () => {
    try {
      const response = await api.get('/push/subscriptions');
      const subscriptions = response.data.subscriptions || [];
      const activeSubscription = subscriptions.find(s => s.is_active);
      
      if (activeSubscription) {
        setSubscription(activeSubscription);
      }
    } catch (err) {
      // Ignore errors - subscription might not exist
    }
  };

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications not supported');
      return false;
    }

    try {
      const permissionStatus = await Notification.requestPermission();
      setPermission(permissionStatus);
      
      if (permissionStatus === 'granted') {
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications not supported');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Request permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return false;
      }

      // 2. Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // 3. Get VAPID public key
      const vapidResponse = await api.get('/push/vapid-key');
      const publicKey = vapidResponse.data.publicKey || VAPID_PUBLIC_KEY;

      // 4. Subscribe to push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 5. Send subscription to backend
      const subscriptionData = {
        endpoint: pushSubscription.endpoint,
        keys: pushSubscription.keys,
        browser: navigator.userAgent,
        os: navigator.platform,
      };

      const response = await api.post('/push/subscribe', subscriptionData);
      setSubscription(response.data.subscription);

      console.log('✅ Subscribed to push notifications');
      return true;
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;

    setLoading(true);
    setError(null);

    try {
      // 1. Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // 2. Get push subscription
      const pushSubscription = await registration.pushManager.getSubscription();
      
      // 3. Unsubscribe from push
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
      }

      // 4. Remove from backend
      await api.post('/push/unsubscribe', {
        endpoint: subscription.endpoint,
      });

      setSubscription(null);
      console.log('✅ Unsubscribed from push notifications');
      return true;
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  // Check current subscription status
  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();
      
      if (!pushSubscription) {
        setSubscription(null);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Check subscription error:', err);
      return false;
    }
  }, []);

  // Show local notification (for testing)
  const showNotification = useCallback((title, options = {}) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-72x72.png',
        data: options.data,
        tag: options.tag,
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'Lihat' },
          { action: 'dismiss', title: 'Tutup' },
        ],
      });
    }
  }, []);

  return {
    isSupported,
    permission,
    subscription,
    loading,
    error,
    subscribe,
    unsubscribe,
    checkSubscription,
    showNotification,
    requestPermission,
  };
}
