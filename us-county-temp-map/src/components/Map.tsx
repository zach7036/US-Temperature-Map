import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { fetchCountyData, fetchTemperatureData } from '../utils/data';
import { CountyData, TemperatureData } from '../types';

const Map: React.FC<{ selectedMonth: number }> = ({ selectedMonth }) => {
    const [countyData, setCountyData] = useState<CountyData[]>([]);
    const [temperatureData, setTemperatureData] = useState<TemperatureData>({});

    useEffect(() => {
        const loadData = async () => {
            const counties = await fetchCountyData();
            const temperatures = await fetchTemperatureData();
            setCountyData(counties);
            setTemperatureData(temperatures);
        };
        loadData();
    }, []);

    const getColor = (countyId: string) => {
        const avgTemp = temperatureData[countyId]?.[selectedMonth];
        return avgTemp ? (avgTemp > 75 ? 'red' : avgTemp > 50 ? 'orange' : 'blue') : 'grey';
    };

    const onEachCounty = (county: any, layer: any) => {
        const countyId = county.properties.id;
        layer.setStyle({ fillColor: getColor(countyId), weight: 2, color: 'white', fillOpacity: 0.7 });
        layer.on({
            click: () => {
                // Handle county click event
            }
        });
        layer.bindPopup(`<strong>${county.properties.name}</strong><br>Avg Temp: ${temperatureData[countyId]?.[selectedMonth] || 'N/A'}°F`);
    };

    return (
        <MapContainer center={[37.8, -96]} zoom={4} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <GeoJSON data={countyData} onEachFeature={onEachCounty} />
        </MapContainer>
    );
};

export default Map;