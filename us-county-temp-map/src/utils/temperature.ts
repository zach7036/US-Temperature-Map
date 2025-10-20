import { MONTHS, type MonthName } from '../constants/months';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const seededValue = (seed: string): number => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = Math.imul(31, hash) + seed.charCodeAt(i);
        hash |= 0; // Force 32-bit integer
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
};

export const generateTemperatureProfile = (countyId: string, latitude: number | null | undefined) => {
    const lat = latitude ?? 37; // Continental US midpoint
    const baseline = 70 - Math.abs(lat - 33) * 1.6;
    const variability = Math.max(9, 18 - Math.abs(lat - 40) * 0.35);
    const randomOffset = (seededValue(`${countyId}-offset`) - 0.5) * 8;
    const seasonalPhase = (seededValue(`${countyId}-phase`) - 0.5) * (Math.PI / 6);
    const profile: Record<MonthName, number> = {} as Record<MonthName, number>;

    MONTHS.forEach((month, index) => {
        const angle = (2 * Math.PI * index) / MONTHS.length;
        const seasonal = Math.sin(angle - Math.PI / 2 + seasonalPhase);
        const localWeather = (seededValue(`${countyId}-${month}`) - 0.5) * 3;
        const temperature = baseline + randomOffset + variability * seasonal + localWeather;
        profile[month] = Math.round(clamp(temperature, -20, 105) * 10) / 10;
    });

    return profile;
};

export const getTemperatureRange = (
    data: Record<string, Record<MonthName, number>>,
    month: MonthName,
): { min: number; max: number } | null => {
    const values: number[] = [];
    Object.values(data).forEach((profile) => {
        const value = profile[month];
        if (typeof value === 'number' && Number.isFinite(value)) {
            values.push(value);
        }
    });

    if (!values.length) {
        return null;
    }

    return {
        min: Math.min(...values),
        max: Math.max(...values),
    };
};

export const formatTemperature = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return 'No data';
    }

    return `${value.toFixed(1)}°F`;
};
