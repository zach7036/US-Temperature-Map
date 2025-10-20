import React from 'react';
import type { CountyTemperatureProfile } from '../types';
import { MONTHS } from '../constants/months';
import { formatTemperature } from '../utils/temperature';

interface CountyPopupProps {
    county: CountyTemperatureProfile;
    selectedMonth: number;
    onClose: () => void;
}

const CountyPopup: React.FC<CountyPopupProps> = ({ county, selectedMonth, onClose }) => (
    <aside className="county-popup" role="dialog" aria-labelledby="county-popup-title">
        <div className="popup-header">
            <h2 id="county-popup-title">
                {county.name}, {county.state}
            </h2>
            <button type="button" onClick={onClose} aria-label="Close county details">
                ×
            </button>
        </div>
        <p className="selected-month">
            <strong>{MONTHS[selectedMonth]} average:</strong> {formatTemperature(county.temperatures[MONTHS[selectedMonth]])}
        </p>
        <div className="temperatures-table">
            <table>
                <caption className="sr-only">Monthly average temperatures</caption>
                <thead>
                    <tr>
                        <th scope="col">Month</th>
                        <th scope="col">Avg. Temp</th>
                    </tr>
                </thead>
                <tbody>
                    {MONTHS.map((month) => (
                        <tr key={month} className={month === MONTHS[selectedMonth] ? 'active' : undefined}>
                            <th scope="row">{month}</th>
                            <td>{formatTemperature(county.temperatures[month])}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </aside>
);

export default CountyPopup;
