import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMap, useMapEvents } from 'react-leaflet';
import type { GeoJSON as LeafletGeoJSON, LeafletMouseEvent } from 'leaflet';
import { scaleSequential } from 'd3-scale';
import { interpolateRdYlBu } from 'd3-scale-chromatic';
import { geoPath } from 'd3-geo';
import type { CountyFeatureCollection, CountyTemperatureProfile } from '../types';
import { MONTHS, type MonthName } from '../constants/months';
import { STATE_FIPS_TO_NAME } from '../constants/states';
import { formatTemperature, generateTemperatureProfile, getTemperatureRange } from '../utils/temperature';

interface MapProps {
    selectedMonth: number;
    onCountySelect: (county: CountyTemperatureProfile | null) => void;
}

interface ActiveCountyPopupProps {
    county: CountyTemperatureProfile | null;
    month: MonthName;
}

const COUNTIES_SOURCE = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';

const SelectedCountyPopup: React.FC<ActiveCountyPopupProps> = ({ county, month }) => {
    const map = useMap();

    useEffect(() => {
        if (county) {
            map.flyTo(county.center, Math.max(map.getZoom(), 5), { animate: true, duration: 0.75 });
        }
    }, [county, map]);

    if (!county) {
        return null;
    }

    return (
        <Popup position={county.center} closeButton={false} className="county-map-popup">
            <div>
                <strong>
                    {county.name}, {county.state}
                </strong>
                <div>{month}: {formatTemperature(county.temperatures[month])}</div>
                <small>Click the map to clear the selection.</small>
            </div>
        </Popup>
    );
};

const MapClickReset: React.FC<{ onReset: () => void }> = ({ onReset }) => {
    useMapEvents({
        click: () => onReset(),
    });

    return null;
};

const Map: React.FC<MapProps> = ({ selectedMonth, onCountySelect }) => {
    const [countyGeoJson, setCountyGeoJson] = useState<CountyFeatureCollection | null>(null);
    const [temperatureByCounty, setTemperatureByCounty] = useState<Record<string, Record<MonthName, number>>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCounty, setActiveCounty] = useState<CountyTemperatureProfile | null>(null);
    const geoJsonRef = useRef<LeafletGeoJSON<any>>(null);

    const monthName = MONTHS[selectedMonth];

    useEffect(() => {
        const fetchCounties = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(COUNTIES_SOURCE);
                if (!response.ok) {
                    throw new Error('Unable to load county boundaries.');
                }

                const geojson = (await response.json()) as CountyFeatureCollection;
                const pathGenerator = geoPath();
                const temperatureLookup: Record<string, Record<MonthName, number>> = {};

                geojson.features.forEach((feature) => {
                    const countyId = String(feature.id ?? feature.properties?.GEO_ID ?? '');
                    if (!countyId) {
                        return;
                    }

                    const centroid = pathGenerator.centroid(feature as any);
                    const latitude = Array.isArray(centroid) && Number.isFinite(centroid[1]) ? centroid[1] : null;
                    temperatureLookup[countyId] = generateTemperatureProfile(countyId, latitude);
                });

                setCountyGeoJson(geojson);
                setTemperatureByCounty(temperatureLookup);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unexpected error while loading map data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCounties();
    }, []);

    const temperatureRange = useMemo(() => getTemperatureRange(temperatureByCounty, monthName), [temperatureByCounty, monthName]);

    const colorScale = useMemo(() => {
        if (!temperatureRange) {
            return () => '#bdbdbd';
        }

        const { min, max } = temperatureRange;
        if (min === max) {
            return () => interpolateRdYlBu(0.2);
        }

        const scale = scaleSequential(interpolateRdYlBu).domain([max, min]);
        return (value: number | null | undefined) => (typeof value === 'number' ? scale(value) : '#bdbdbd');
    }, [temperatureRange]);

    const updateLayerStyles = useCallback(() => {
        if (!geoJsonRef.current) {
            return;
        }

        geoJsonRef.current.eachLayer((layer: any) => {
            const feature = layer.feature;
            if (!feature) {
                return;
            }

            const countyId = String(feature.id ?? feature.properties?.GEO_ID ?? '');
            if (!countyId) {
                return;
            }

            const temperature = temperatureByCounty[countyId]?.[monthName];
            const isActive = activeCounty?.id === countyId;
            layer.setStyle({
                fillColor: colorScale(temperature),
                weight: isActive ? 2 : 0.4,
                color: isActive ? '#1f2937' : '#f5f5f5',
                fillOpacity: isActive ? 0.9 : 0.75,
            });
        });
    }, [activeCounty, colorScale, monthName, temperatureByCounty]);

    useEffect(() => {
        updateLayerStyles();
    }, [updateLayerStyles]);

    const handleCountySelection = useCallback(
        (profile: CountyTemperatureProfile | null) => {
            setActiveCounty(profile);
            onCountySelect(profile);
        },
        [onCountySelect],
    );

    const handleFeatureEvents = useCallback(
        (feature: any, layer: any) => {
            const countyId = String(feature.id ?? feature.properties?.GEO_ID ?? '');
            if (!countyId) {
                return;
            }

            const countyName = feature.properties?.NAME ?? 'Unknown';
            const stateCode = feature.properties?.STATE ?? '';
            const stateName = STATE_FIPS_TO_NAME[stateCode] ?? 'Unknown';

            layer.on({
                click: (event: LeafletMouseEvent) => {
                    event.originalEvent?.preventDefault();
                    event.originalEvent?.stopPropagation();

                    const bounds = layer.getBounds();
                    const center = bounds.getCenter();
                    const temperatures = temperatureByCounty[countyId];
                    if (!temperatures) {
                        return;
                    }

                    const profile: CountyTemperatureProfile = {
                        id: countyId,
                        name: countyName,
                        state: stateName,
                        center: [center.lat, center.lng],
                        temperatures,
                    };
                    handleCountySelection(profile);
                },
                mouseover: () => {
                    layer.setStyle({ weight: 2, color: '#4b5563', fillOpacity: 0.85 });
                },
                mouseout: () => {
                    updateLayerStyles();
                },
            });

            layer.bindTooltip(`${countyName}, ${stateName}`, { sticky: true, direction: 'top' });
        },
        [handleCountySelection, temperatureByCounty, updateLayerStyles],
    );

    return (
        <div className="map-shell">
            {isLoading && <div className="map-status">Loading county data…</div>}
            {error && !isLoading && <div className="map-status error">{error}</div>}
            <MapContainer center={[37.8, -96]} zoom={4} minZoom={3} maxZoom={9} className="map-container">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {countyGeoJson && (
                    <GeoJSON
                        data={countyGeoJson as any}
                        ref={geoJsonRef}
                        style={(feature) => {
                            const countyId = String(feature?.id ?? feature?.properties?.GEO_ID ?? '');
                            const temperature = countyId ? temperatureByCounty[countyId]?.[monthName] : null;
                            const isActive = activeCounty?.id === countyId;
                            return {
                                fillColor: colorScale(temperature),
                                weight: isActive ? 2 : 0.4,
                                color: isActive ? '#1f2937' : '#f5f5f5',
                                fillOpacity: isActive ? 0.9 : 0.75,
                            };
                        }}
                        onEachFeature={handleFeatureEvents}
                    />
                )}
                <MapClickReset onReset={() => handleCountySelection(null)} />
                <SelectedCountyPopup county={activeCounty} month={monthName} />
            </MapContainer>
            {temperatureRange && (
                <div className="legend">
                    <div className="legend-scale" aria-hidden="true" />
                    <div className="legend-labels">
                        <span>{Math.round(temperatureRange.max)}°F</span>
                        <span>Warmer</span>
                        <span>Cooler</span>
                        <span>{Math.round(temperatureRange.min)}°F</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Map;
