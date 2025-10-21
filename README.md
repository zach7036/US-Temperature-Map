# Interactive US County Temperature Map

An interactive visualization of average monthly temperatures for every county in the United States, using real climate data from NOAA (National Oceanic and Atmospheric Administration).

## Features

- **All US Counties**: Displays all 3,136 counties in the contiguous United States
- **Monthly Temperature Data**: Shows average temperature for each of 12 months
- **Color-Coded Visualization**: Temperature gradient from blue (cold) to red (hot)
- **Interactive Controls**: Select any month to view temperature patterns
- **Hover Tooltips**: See exact temperature and county information on hover
- **Real NOAA Data**: Uses 30-year climate normals (1991-2020) from NOAA's Climate Divisional Database

## Quick Start

### Prerequisites

- Node.js (v12 or higher)

### Installation and Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

## Data Sources

### Temperature Data
- **Source**: NOAA National Centers for Environmental Information (NCEI)
- **Dataset**: NClimDiv (NOAA Monthly U.S. Climate Divisional Database)
- **Period**: 1991-2020 (30-year climate normals)
- **Counties**: 3,136 counties with complete temperature records

### Geographic Boundaries
- **Source**: U.S. Census Bureau via TopoJSON
- **Format**: TopoJSON with Albers USA projection
- **Resolution**: 1:10,000,000 scale

## Project Structure

```
US-Temperature-Map/
├── data/
│   ├── counties-albers-10m.json      # County boundary TopoJSON
│   ├── county-temperatures.json      # Processed temperature data
│   └── county-temps-raw.txt          # Raw NOAA climate data
├── public/
│   ├── index.html                    # Main HTML file
│   ├── styles.css                    # Stylesheet
│   └── app.js                        # D3.js visualization code
├── scripts/
│   └── process-temperature-data.js   # Data processing script
├── server.js                         # Simple HTTP server
├── package.json                      # Node.js dependencies
└── README.md                         # This file
```

## How It Works

### Data Processing

The raw NOAA climate data is processed by `scripts/process-temperature-data.js`:

1. Reads the raw NOAA county temperature file (391,130 records)
2. Filters data for average temperature records from 1991-2020
3. Calculates 30-year average for each month for each county
4. Outputs a JSON file mapping FIPS codes to monthly averages

### Visualization

The D3.js application (`public/app.js`):

1. Loads county boundary TopoJSON and temperature data
2. Renders counties using D3's geographic path generator
3. Applies color scale based on current month's temperature
4. Updates colors when user selects different month
5. Shows tooltips with temperature information on hover

### Color Scale

The color scale dynamically adjusts for each month:
- Blue shades: Colder temperatures
- Yellow/Green: Moderate temperatures
- Red shades: Warmer temperatures
- Gray: Missing data

The scale uses the actual min/max temperatures for each month to ensure optimal color distribution.

## Technologies Used

- **D3.js v7**: Data visualization and geographic projection
- **TopoJSON**: Efficient geographic data format
- **Vanilla JavaScript**: No heavy frameworks needed
- **Node.js**: Simple HTTP server and data processing

## Temperature Data Format

The processed temperature data is structured as:

```json
{
  "01001": {
    "fips": "01001",
    "temps": [44.0, 48.2, 56.5, 63.8, 71.2, 78.5, 81.3, 80.9, 76.2, 65.3, 55.1, 46.8]
  }
}
```

Where:
- Key is the 5-digit FIPS code (state + county)
- `temps` array contains 12 values (Jan-Dec) in Fahrenheit
- `null` values indicate missing data

## Future Enhancements

Potential improvements:
- Add state/county name labels
- Include additional climate variables (precipitation, humidity)
- Add time series animation
- Compare historical vs projected temperatures
- Mobile-responsive touch controls
- Export/share functionality

## Data Update

To update with newer NOAA data:

1. Download latest `climdiv-tmpccy` file from NOAA:
   ```
   https://www.ncei.noaa.gov/pub/data/cirs/climdiv/
   ```

2. Replace `data/county-temps-raw.txt`

3. Run the processing script:
   ```bash
   npm run process-data
   ```

4. Restart the server

## Credits

- **Data**: NOAA National Centers for Environmental Information
- **Geography**: U.S. Census Bureau
- **TopoJSON Library**: Mike Bostock and contributors
- **D3.js Library**: Mike Bostock and contributors

## License

ISC License

The temperature data is provided by NOAA and is in the public domain. Geographic boundary data from the U.S. Census Bureau is also public domain.
