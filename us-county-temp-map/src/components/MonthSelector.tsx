import React from 'react';
import { MONTHS } from '../constants/months';

interface MonthSelectorProps {
    selectedMonth: number;
    onMonthChange: (month: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => (
    <div className="month-selector">
        <label htmlFor="month">Select month</label>
        <select
            id="month"
            value={selectedMonth}
            onChange={(event) => onMonthChange(Number(event.target.value))}
        >
            {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                    {month}
                </option>
            ))}
        </select>
    </div>
);

export default MonthSelector;
