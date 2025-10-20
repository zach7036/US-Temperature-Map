import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { MonthName } from '../constants/months';

export interface CountyFeatureProperties extends GeoJsonProperties {
    GEO_ID: string;
    STATE: string;
    COUNTY: string;
    NAME: string;
    LSAD: string;
    CENSUSAREA: number;
}

export type CountyFeatureCollection = FeatureCollection<Geometry, CountyFeatureProperties>;

export interface CountyTemperatureProfile {
    id: string;
    name: string;
    state: string;
    center: [number, number];
    temperatures: Record<MonthName, number>;
}