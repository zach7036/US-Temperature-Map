const fs = require('fs');
const path = require('path');

// Read the raw temperature data
const rawData = fs.readFileSync(path.join(__dirname, '../data/county-temps-raw.txt'), 'utf-8');
const lines = rawData.split('\n').filter(line => line.trim());

console.log(`Processing ${lines.length} lines of temperature data...`);

// Process data: Calculate average temperature for each month for each county
// Using data from 1991-2020 (standard 30-year climate normal period)
const countyData = {};
const START_YEAR = 1991;
const END_YEAR = 2020;

lines.forEach((line, index) => {
  // Format: SSCCCEEYYY + 12 monthly values
  // SS = State FIPS (2 digits)
  // CCC = County FIPS (3 digits)
  // EE = Element code (02 = avg temp)
  // YYYY = Year

  const stateFips = line.substring(0, 2);
  const countyFips = line.substring(2, 5);
  const elementCode = line.substring(5, 7);
  const year = parseInt(line.substring(7, 11));

  // Only process average temperature (02) for recent 30-year period
  if (elementCode !== '02' || year < START_YEAR || year > END_YEAR) {
    return;
  }

  const fipsCode = stateFips + countyFips;

  // Extract 12 monthly temperature values
  const monthlyTemps = [];
  for (let i = 0; i < 12; i++) {
    const start = 11 + (i * 7);
    const tempStr = line.substring(start, start + 7).trim();
    const temp = parseFloat(tempStr);

    // -99.99 or similar values indicate missing data
    if (!isNaN(temp) && temp > -90) {
      monthlyTemps.push(temp);
    } else {
      monthlyTemps.push(null);
    }
  }

  // Initialize county data if not exists
  if (!countyData[fipsCode]) {
    countyData[fipsCode] = {
      fips: fipsCode,
      monthSums: new Array(12).fill(0),
      monthCounts: new Array(12).fill(0)
    };
  }

  // Add to running totals for averaging
  monthlyTemps.forEach((temp, monthIndex) => {
    if (temp !== null) {
      countyData[fipsCode].monthSums[monthIndex] += temp;
      countyData[fipsCode].monthCounts[monthIndex]++;
    }
  });

  if (index % 10000 === 0) {
    console.log(`Processed ${index} lines...`);
  }
});

// Calculate averages and format output
const outputData = {};
let countyCount = 0;

Object.keys(countyData).forEach(fips => {
  const county = countyData[fips];
  const monthlyAverages = [];

  for (let i = 0; i < 12; i++) {
    if (county.monthCounts[i] > 0) {
      monthlyAverages.push(
        Math.round((county.monthSums[i] / county.monthCounts[i]) * 10) / 10
      );
    } else {
      monthlyAverages.push(null);
    }
  }

  // Only include counties with at least some data
  const validMonths = monthlyAverages.filter(t => t !== null).length;
  if (validMonths >= 6) {
    outputData[fips] = {
      fips: fips,
      temps: monthlyAverages
    };
    countyCount++;
  }
});

console.log(`\nProcessed ${countyCount} counties with temperature data`);
console.log(`Period: ${START_YEAR}-${END_YEAR} (30-year climate normals)`);

// Save to JSON file
const outputPath = path.join(__dirname, '../data/county-temperatures.json');
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

console.log(`\nData saved to: ${outputPath}`);
console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

// Create a summary
const sampleFips = Object.keys(outputData)[0];
console.log(`\nSample data for FIPS ${sampleFips}:`);
console.log(JSON.stringify(outputData[sampleFips], null, 2));
