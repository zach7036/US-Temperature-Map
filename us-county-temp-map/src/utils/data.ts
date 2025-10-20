export const fetchMonthlyTemperatures = async (countyId: string): Promise<number[]> => {
    const response = await fetch('/data/monthly_temps.json');
    const data = await response.json();
    return data[countyId] || [];
};

export const processTemperatureData = (data: Record<string, number[]>): Array<{ countyId: string; temperatures: number[] }> => {
    return Object.entries(data).map(([countyId, temperatures]) => ({
        countyId,
        temperatures,
    }));
};