export const getCountyTemperature = (countyId: string, month: number, data: any) => {
    const countyData = data[countyId];
    return countyData ? countyData[month] : null;
};

export const getColorForTemperature = (temperature: number) => {
    if (temperature === null) return '#ccc'; // Default color for no data
    if (temperature < 32) return '#00f'; // Blue for cold temperatures
    if (temperature < 60) return '#0ff'; // Cyan for cool temperatures
    if (temperature < 80) return '#ff0'; // Yellow for warm temperatures
    return '#f00'; // Red for hot temperatures
};

export const getCountyName = (countyId: string, geoData: any) => {
    const feature = geoData.features.find((f: any) => f.id === countyId);
    return feature ? feature.properties.name : 'Unknown County';
};