import React from 'react';

interface MonthSelectorProps {
    selectedMonth: number;
    onMonthChange: (month: number) => void;
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
    return (
        <div className="month-selector">
            <label htmlFor="month">Select Month:</label>
            <select
                id="month"
                value={selectedMonth}
                onChange={(e) => onMonthChange(Number(e.target.value))}
            >
                {months.map((month, index) => (
                    <option key={index} value={index}>
                        {month}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default MonthSelector;