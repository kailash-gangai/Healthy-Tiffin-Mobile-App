// notifications.ts
import notifee, {
  AndroidImportance,
  AndroidStyle,
  AuthorizationStatus,
  EventType,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ---- Static plan ---- */
export const MEALS = [
  {
    key: 'breakfast',
    hour: 8,
    minute: 0,
    title: 'Breakfast',
    message: 'Healthy breakfast time.',
  },
  {
    key: 'lunch',
    hour: 12,
    minute: 0,
    title: 'Lunch',
    message: 'Have your lunch.',
  },
  {
    key: 'dinner',
    hour: 20,
    minute: 0,
    title: 'Dinner',
    message: 'Light dinner time.',
  },
];
export const WATER_PLAN = {
  startHour: 6,
  endHour: 22,
  reminders: 12,
  mlPerTap: 250,
};

/* ---- Setup ---- */
export async function ensureChannel() {
  await notifee.createChannel({
    id: 'notification',
    name: 'Healthy Tiffin',
    importance: AndroidImportance.HIGH,
  });
}

export async function initNotifications() {
  const s = await notifee.requestPermission();
  if (s.authorizationStatus !== AuthorizationStatus.AUTHORIZED) return false;
  await ensureChannel();
  await notifee.setNotificationCategories([
    {
      id: 'water',
      actions: [
        { id: 'drink-250', title: `I drank ${WATER_PLAN.mlPerTap} ml` },
      ],
    },
  ]);
  return true;
}

/* ---- Immediate promo ---- */
export async function showHealthyTiffinNow(
  title = 'Healthy Tiffin',
  body = 'Eat well today',
) {
  const ok = await initNotifications();
  if (!ok) return;
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: 'notification',
      // keep default launcher icon; you can replace later
      smallIcon: 'ic_launcher',
      style: {
        type: AndroidStyle.BIGPICTURE,
        picture: 'https://picsum.photos/800/400',
      },
      pressAction: { id: 'open-app' },
      actions: [
        {
          title: `I drank ${WATER_PLAN.mlPerTap} ml`,
          pressAction: { id: 'drink-250' },
        },
      ],
    },
    ios: {
      categoryId: 'water',
      foregroundPresentationOptions: { alert: true, sound: true, badge: true },
      attachments: [{ url: 'https://picsum.photos/800/400' }],
    },
    data: { kind: 'promo' },
  });
}

/* ---- Helpers ---- */
function nextAt(hour: number, minute: number) {
  const now = new Date();
  const t = new Date();
  t.setHours(hour, minute, 0, 0);
  if (t <= now) t.setDate(t.getDate() + 1);
  return t.getTime();
}

function evenlySpacedTimes(startHour: number, endHour: number, count: number) {
  const totalMinutes = (endHour - startHour) * 60;
  const step = Math.floor(totalMinutes / count);
  const out: Array<{ hour: number; minute: number }> = [];
  for (let i = 0; i < count; i++) {
    const mins = i * step;
    out.push({ hour: startHour + Math.floor(mins / 60), minute: mins % 60 });
  }
  return out;
}

/* ---- Scheduling ---- */
export async function scheduleMealNotifications() {
  const ok = await initNotifications();
  if (!ok) return;
  for (const meal of MEALS) {
    await notifee.createTriggerNotification(
      {
        title: meal.title,
        body: meal.message,
        data: { kind: 'meal', key: meal.key },
        android: {
          channelId: 'notification',
          smallIcon: 'ic_launcher',
          pressAction: { id: 'open-app' },
        },
        ios: {
          categoryId: 'water',
          foregroundPresentationOptions: {
            alert: true,
            sound: true,
            badge: true,
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: nextAt(meal.hour, meal.minute),
        repeatFrequency: RepeatFrequency.DAILY,

        alarmManager: { allowWhileIdle: true },
      },
    );
  }
}

export async function scheduleWaterNotifications() {
  const ok = await initNotifications();
  if (!ok) return;
  const times = evenlySpacedTimes(
    WATER_PLAN.startHour,
    WATER_PLAN.endHour,
    WATER_PLAN.reminders,
  );
  for (const [idx, t] of times.entries()) {
    await notifee.createTriggerNotification(
      {
        title: 'Hydration',
        body: 'Stay hydrated. Log a glass.',
        data: { kind: 'water', idx: String(idx) },
        android: {
          channelId: 'notification',
          smallIcon: 'ic_launcher',
          actions: [
            {
              title: `I drank ${WATER_PLAN.mlPerTap} ml`,
              pressAction: { id: 'drink-250' },
            },
          ],
          pressAction: { id: 'open-app' },
        },
        ios: {
          categoryId: 'water',
          foregroundPresentationOptions: {
            alert: true,
            sound: true,
            badge: true,
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: nextAt(t.hour, t.minute),
        alarmManager: { allowWhileIdle: true },
      },
    );
  }
}

export async function clearAndRescheduleAll() {
  await notifee.cancelAllNotifications();
  await notifee.cancelTriggerNotifications();
  await scheduleMealNotifications();
  await scheduleWaterNotifications();
}

/* ---- Water tally ---- */
const WATER_KEY = 'water-tally'; // { 'YYYY-MM-DD': number }
const yyyyMmDd = (d = new Date()) => d.toISOString().slice(0, 10);

export async function incrementWater(ml: number) {
  const k = yyyyMmDd();
  const raw = (await AsyncStorage.getItem(WATER_KEY)) || '{}';
  const obj = JSON.parse(raw) as Record<string, number>;
  obj[k] = (obj[k] || 0) + ml;
  await AsyncStorage.setItem(WATER_KEY, JSON.stringify(obj));
  await notifee.setBadgeCount(Math.round((obj[k] || 0) / WATER_PLAN.mlPerTap));
  return obj[k];
}

/* ---- Event handlers ---- */
export function registerNotifeeHandlers() {
  notifee.onForegroundEvent(async ({ type, detail }) => {
    if (
      type === EventType.ACTION_PRESS &&
      detail.pressAction?.id === 'drink-250'
    ) {
      await incrementWater(WATER_PLAN.mlPerTap);
    }
  });
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (
      type === EventType.ACTION_PRESS &&
      detail.pressAction?.id === 'drink-250'
    ) {
      await incrementWater(WATER_PLAN.mlPerTap);
    }
  });
}
export async function debugScheduled() {
  const ids = await notifee.getTriggerNotificationIds();
  const triggers = await notifee.getTriggerNotifications();
  console.log(triggers, 'triggers');
  console.log('Trigger IDs:', ids);
  console.log(
    'Triggers:',
    triggers.map((t: any) => ({
      id: t.notification.title,
      when: new Date((t.trigger as any)?.timestamp || 0).toString(),
      repeat: (t.trigger as any)?.repeatFrequency,
    })),
  );
}
