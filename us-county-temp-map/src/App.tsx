import React, { useCallback, useState } from 'react';
import Map from './components/Map';
import MonthSelector from './components/MonthSelector';
import CountyPopup from './components/CountyPopup';
import { MONTHS } from './constants/months';
import type { CountyTemperatureProfile } from './types';
import './styles/index.css';

const App: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const [selectedCounty, setSelectedCounty] = useState<CountyTemperatureProfile | null>(null);

    const handleMonthChange = useCallback((monthIndex: number) => {
        setSelectedMonth(monthIndex);
    }, []);

    const handleCountySelect = useCallback((county: CountyTemperatureProfile | null) => {
        setSelectedCounty(county);
    }, []);

    return (
        <div className="app">
            <header className="app-header">
                <h1>US County Average Temperatures</h1>
                <p>Explore monthly average temperatures across more than 3,000 US counties. Select a month below and click any county to view the full annual profile.</p>
            </header>
            <div className="controls">
                <MonthSelector selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />
                <div className="current-month">Currently viewing: <strong>{MONTHS[selectedMonth]}</strong></div>
            </div>
            <div className="map-wrapper">
                <Map selectedMonth={selectedMonth} onCountySelect={handleCountySelect} />
            </div>
            {selectedCounty && (
                <CountyPopup county={selectedCounty} selectedMonth={selectedMonth} onClose={() => setSelectedCounty(null)} />
            )}
        </div>
    );
};

export default App;
