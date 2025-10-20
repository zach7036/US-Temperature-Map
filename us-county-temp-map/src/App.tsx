import React, { useState } from 'react';
import Map from './components/Map';
import MonthSelector from './components/MonthSelector';
import './styles/index.css';

const App: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 for January, 1 for February, etc.
    const [selectedCounty, setSelectedCounty] = useState<string | null>(null);

    const handleMonthChange = (month: number) => {
        setSelectedMonth(month);
        setSelectedCounty(null); // Reset selected county when month changes
    };

    const handleCountyClick = (countyName: string) => {
        setSelectedCounty(countyName);
    };

    return (
        <div className="app">
            <h1>US County Average Temperatures</h1>
            <MonthSelector selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />
            <Map selectedMonth={selectedMonth} onCountyClick={handleCountyClick} />
            {selectedCounty && <div className="county-popup">Details for {selectedCounty}</div>}
        </div>
    );
};

export default App;