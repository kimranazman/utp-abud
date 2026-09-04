import { Bell, BellOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';

export const NotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  // Don't show anything if notifications are not supported
  if (!('Notification' in window)) {
    return null;
  }

  // Don't show if already granted
  if (permission === 'granted') {
    return null;
  }

  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {permission === 'denied' ? (
            <>
              <BellOff className="h-4 w-4" />
              <span>Notifications are blocked. Enable them in your browser settings to receive message alerts.</span>
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" />
              <span>Enable notifications to receive alerts when you get new messages.</span>
            </>
          )}
        </div>
        {permission === 'default' && (
          <Button onClick={requestPermission} size="sm" variant="outline">
            Enable Notifications
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};