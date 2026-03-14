import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, XCircle, Smartphone, Globe, Shield } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { Card, Button, LoadingSpinner } from '../components/ui/BaseComponents';

export default function NotificationSettingsPage() {
  const {
    isSupported,
    permission,
    subscription,
    loading,
    error,
    subscribe,
    unsubscribe,
  } = useNotification();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      const response = await fetch('/api/push/subscriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      loadSubscriptions();
    }
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) {
      loadSubscriptions();
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Allowed' };
      case 'denied':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, label: 'Blocked' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: Bell, label: 'Not Set' };
    }
  };

  const permissionStatus = getPermissionStatus();
  const PermissionIcon = permissionStatus.icon;

  if (!isSupported) {
    return (
      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-gray-400" />
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
          <div className="text-center py-8">
            <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Push notifications are not supported in your browser.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your push notification settings
        </p>
      </div>

      {/* Main Status Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${permissionStatus.bg}`}>
              <PermissionIcon className={`w-6 h-6 ${permissionStatus.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
              <p className={`text-sm ${permissionStatus.color} font-medium`}>
                {permissionStatus.label}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {!subscription ? (
            <Button
              onClick={handleSubscribe}
              disabled={loading || permission === 'denied'}
              className="w-full"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleUnsubscribe}
              variant="secondary"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  Disable Notifications
                </>
              )}
            </Button>
          )}

          {permission === 'denied' && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                ❌ {error}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Benefits Card */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          What You'll Get
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              Real-time order status updates
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              Payment confirmation notifications
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              Order ready for pickup alerts
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">
              Special promotions and offers
            </span>
          </li>
        </ul>
      </Card>

      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Active Devices
          </h3>
          <div className="space-y-2">
            {loadingSubscriptions ? (
              <div className="text-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {sub.browser || 'Browser'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {sub.os || 'Unknown OS'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.is_active ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Privacy Info */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
              Your Privacy
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              We only send notifications about your orders and important updates. 
              You can disable notifications at any time from this page.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
