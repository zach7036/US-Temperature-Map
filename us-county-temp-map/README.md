# US County Temperature Map

This project is an interactive web application that displays the average temperature for each month of the year across US counties. Users can select a month and click on individual counties to view detailed temperature information.

## Project Structure

```
us-county-temp-map
├── src
│   ├── index.tsx          # Entry point of the React application
│   ├── App.tsx            # Main application component
│   ├── components          # Contains reusable components
│   │   ├── Map.tsx        # Interactive county map component
│   │   ├── MonthSelector.tsx # Component for selecting the month
│   │   └── CountyPopup.tsx # Popup for displaying county details
│   ├── styles              # CSS styles for the application
│   │   └── index.css
│   ├── data                # Data files
│   │   ├── counties.geojson # GeoJSON data for US counties
│   │   └── monthly_temps.json # Average temperature data
│   ├── utils               # Utility functions
│   │   ├── data.ts        # Functions for fetching and processing data
│   │   └── mapHelpers.ts  # Helper functions for map interactions
│   └── types               # TypeScript interfaces
│       └── index.ts
├── public
│   └── index.html          # Main HTML file for the application
├── package.json            # npm configuration file
├── tsconfig.json           # TypeScript configuration file
├── .gitignore              # Git ignore file
└── README.md               # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd us-county-temp-map
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Usage

- Select a month from the dropdown menu to view average temperatures for that month.
- Click on any county on the map to see detailed temperature information in a popup.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.