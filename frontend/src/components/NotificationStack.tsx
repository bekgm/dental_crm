/** Toast notification display component. */

import { Alert, Snackbar, Stack } from '@mui/material';
import { useNotificationStore } from '@/store/notificationStore';

export default function NotificationStack() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <Stack spacing={1} sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
      {notifications.map((notif) => (
        <Snackbar
          key={notif.id}
          open
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={() => removeNotification(notif.id)}
        >
          <Alert
            severity={notif.type}
            variant="filled"
            onClose={() => removeNotification(notif.id)}
            sx={{ minWidth: 300 }}
          >
            {notif.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
}
