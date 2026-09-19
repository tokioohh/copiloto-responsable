import { useState, useEffect } from 'react';
import { sensorService } from '../services/sensorService';
import { AccelerometerData, GyroscopeData } from '../types/sensor';

/**
 * Hook to stream live accelerometer and gyroscope sensor readings
 * Useful for debugging, calibration, and live UI instrumentation
 */
export function useSensorData(enabled: boolean = true) {
  const [accelerometer, setAccelerometer] = useState<AccelerometerData | null>(null);
  const [gyroscope, setGyroscope] = useState<GyroscopeData | null>(null);
  const [isAvailable, setIsAvailable] = useState<{
    accelerometer: boolean;
    gyroscope: boolean;
  }>({ accelerometer: false, gyroscope: false });

  useEffect(() => {
    let isMounted = true;

    sensorService.checkAvailability().then((avail) => {
      if (isMounted) {
        setIsAvailable(avail);
      }
    });

    if (!enabled) return;

    const accelSub = sensorService.startAccelerometer((data) => {
      if (isMounted) setAccelerometer(data);
    });

    const gyroSub = sensorService.startGyroscope((data) => {
      if (isMounted) setGyroscope(data);
    });

    return () => {
      isMounted = false;
      accelSub.unsubscribe();
      gyroSub.unsubscribe();
    };
  }, [enabled]);

  return {
    accelerometer,
    gyroscope,
    isAvailable,
  };
}
