import React from 'react';

interface CountyPopupProps {
    countyName: string;
    averageTemperature: number;
    month: string;
    onClose: () => void;
}

const CountyPopup: React.FC<CountyPopupProps> = ({ countyName, averageTemperature, month, onClose }) => {
    return (
        <div className="popup">
            <h2>{countyName}</h2>
            <p>Average Temperature in {month}: {averageTemperature}°F</p>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default CountyPopup;