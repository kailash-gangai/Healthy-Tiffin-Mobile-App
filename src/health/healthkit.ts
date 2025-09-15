import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
} from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Steps],
    write: [],
  },
};

export function initHealth(): Promise<void> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(permissions, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}
const dayOpts = (): HealthInputOptions => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  return { startDate: start.toISOString(), endDate: end.toISOString() };
};

export function getTodaySteps(): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const opts: HealthInputOptions = { startDate: start.toISOString() };

  return new Promise((resolve, reject) => {
    AppleHealthKit.getDailyStepCountSamples(opts, (err, samples) => {
      if (err) return reject(err);
      // samples: [{startDate,endDate,value}]
      const total =
        samples?.reduce((sum: number, s: any) => sum + (s.value ?? 0), 0) ?? 0;
      resolve(total);
    });
  });
}
const ASLEEP = new Set(['ASLEEP', 'ASLEEP_CORE', 'ASLEEP_DEEP', 'ASLEEP_REM']);
export function getTodaySleepMinutes(): Promise<number> {
  const opts = dayOpts();
  return new Promise((resolve, reject) => {
    AppleHealthKit.getSleepSamples(opts, (err, samples) => {
      if (err) return reject(err);
      const minutes = (samples ?? [])
        .filter((s: any) => ASLEEP.has(s.value))
        .reduce((m: number, s: any) => {
          const ms =
            new Date(s.endDate).getTime() - new Date(s.startDate).getTime();
          return m + ms / 60000;
        }, 0);
      resolve(Math.round(minutes));
    });
  });
}

// WATER (mL)
export function getTodayWaterMl(): Promise<number> {
  const opts = dayOpts();
  return new Promise((resolve, reject) => {
    AppleHealthKit.getWaterSamples(opts, (err, samples) => {
      if (err) return reject(err);
      const ml = (samples ?? []).reduce(
        (n: number, s: any) => n + (s.value ?? 0),
        0,
      );
      resolve(Math.round(ml));
    });
  });
}

// CALORIES BURNED (kcal)
export function getTodayActiveCaloriesKcal(): Promise<number> {
  const opts = dayOpts();
  return new Promise((resolve, reject) => {
    AppleHealthKit.getActiveEnergyBurned(opts, (err, res: any) => {
      if (err) return reject(err);
      resolve(Math.round(res?.value ?? 0));
    });
  });
}

// CALORIES CONSUMED (kcal) — optional
export function getTodayDietaryCaloriesKcal(): Promise<number> {
  const opts = dayOpts();
  return new Promise((resolve, reject) => {
    AppleHealthKit.getEnergyConsumedSamples(opts, (err, samples) => {
      if (err) return reject(err);
      const kcal = (samples ?? []).reduce(
        (n: number, s: any) => n + (s.value ?? 0),
        0,
      );
      resolve(Math.round(kcal));
    });
  });
}
