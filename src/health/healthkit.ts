import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
} from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.ActivitySummary,
      AppleHealthKit.Constants.Permissions.Water,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.EnergyConsumed,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.ActivitySummary,
      AppleHealthKit.Constants.Permissions.Water,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.EnergyConsumed,
      AppleHealthKit.Constants.Permissions.ActivitySummary,
    ],
  },
};

export const checkHealthKitConnection = () => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.isAvailable((err, isAvailable) => {
      if (err) {
        console.log('Error checking HealthKit availability:', err);
        reject('Error checking HealthKit availability');
      } else if (isAvailable) {
        console.log('HealthKit is connected and available.');
        resolve(true); // Resolving true when HealthKit is available
      } else {
        console.log('HealthKit is not connected or unavailable.');
        resolve(false); // Resolving false when HealthKit is not available
      }
    });
  });
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

const getHealthDataForDateRange = async (
  startDate: string,
  endDate: string,
) => {
  try {
    // Format startDate and endDate to ISO string (if not already in ISO format)
    const startDateISO = new Date(startDate).toISOString();
    const endDateISO = new Date(endDate).toISOString();

    // Get Step Count Data
    const stepOptions = {
      startDate: startDateISO,
      endDate: endDateISO,
    };
    const stepCountData = await new Promise((resolve, reject) => {
      AppleHealthKit.getDailyStepCountSamples(stepOptions, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
    console.log('Step Count Data:', stepCountData);

    // Get Sleep Data
    const sleepOptions = {
      startDate: startDateISO,
      endDate: endDateISO,
    };
    const sleepData = await new Promise((resolve, reject) => {
      AppleHealthKit.getSleepSamples(sleepOptions, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
    console.log('Sleep Data:', sleepData);

    // Get Active Energy Burned (Calories)
    const caloriesOptions = {
      startDate: startDateISO,
      endDate: endDateISO,
    };
    const caloriesData = await new Promise((resolve, reject) => {
      AppleHealthKit.getActiveEnergyBurned(caloriesOptions, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
    console.log('Calories Data:', caloriesData);

    // Get Dietary Water Intake
    const waterOptions = {
      startDate: startDateISO,
      endDate: endDateISO,
    };
    const waterData = await new Promise((resolve, reject) => {
      AppleHealthKit.getWaterSamples(waterOptions, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
    console.log('Water Data:', waterData);

    // Return all results as an object
    return {
      stepCountData,
      sleepData,
      caloriesData,
      waterData,
    };
  } catch (error) {
    console.log('Error fetching data:', error);
    return null;
  }
};



