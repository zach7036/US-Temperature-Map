export interface County {
    id: string;
    name: string;
    state: string;
    geometry: {
        type: string;
        coordinates: number[][][]; // Assuming the coordinates are in a 2D array format
    };
}

export interface TemperatureData {
    countyId: string;
    monthlyTemperatures: {
        [month: string]: number; // Keyed by month (e.g., "January", "February", etc.)
    };
}