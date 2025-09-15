import notifee, { AndroidImportance } from '@notifee/react-native';

export async function ensureChannel() {
  await notifee.createChannel({
    id: 'notification',
    name: 'notification',
    importance: AndroidImportance.HIGH,
  });
}

export async function showBarNotification(
  title: string,
  body: string,
  data: Record<string, string> = {},
) {
  // ask once; harmless if already granted
  await notifee.requestPermission();
  await ensureChannel();

  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: 'notification',
      // fallback to app icon; replace with your own later
      smallIcon: 'ic_launcher',
      pressAction: { id: 'notification' },
    },
    ios: {
      foregroundPresentationOptions: { alert: true, sound: true, badge: true },
    },
  });
}
