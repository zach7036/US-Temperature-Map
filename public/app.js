// State management
let currentMonth = 6; // July (0-indexed)
let temperatureData = {};
let countyFeatures = [];
let colorScale;

// Month names for display
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Initialize the application
async function init() {
    try {
        console.log('Loading data...');

        // Load both datasets in parallel
        const [topology, tempData] = await Promise.all([
            d3.json('../data/counties-albers-10m.json'),
            d3.json('../data/county-temperatures.json')
        ]);

        console.log('Data loaded successfully');

        // Store temperature data
        temperatureData = tempData;

        // Convert TopoJSON to GeoJSON
        countyFeatures = topojson.feature(topology, topology.objects.counties).features;
        console.log(`Loaded ${countyFeatures.length} counties`);

        // Create the map
        createMap();

        // Setup event listeners
        setupEventListeners();

        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
        alert('Error loading map data. Please check the console for details.');
    }
}

// Create and render the map
function createMap() {
    const container = d3.select('#map-container');
    const width = container.node().getBoundingClientRect().width;
    const height = 610; // Matches the Albers projection viewport

    const svg = d3.select('#map')
        .attr('viewBox', `0 0 975 ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Clear existing content
    svg.selectAll('*').remove();

    // Create color scale
    updateColorScale();

    // Create path generator
    const path = d3.geoPath();

    // Draw counties
    svg.append('g')
        .selectAll('path')
        .data(countyFeatures)
        .join('path')
        .attr('class', 'county')
        .attr('d', path)
        .attr('fill', d => getCountyColor(d))
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut);

    // Update legend
    updateLegend();
}

// Get color for a county based on current month's temperature
function getCountyColor(feature) {
    const fips = feature.id;
    const countyData = temperatureData[fips];

    if (!countyData || !countyData.temps || countyData.temps[currentMonth] === null) {
        return '#e0e0e0'; // Gray for missing data
    }

    const temp = countyData.temps[currentMonth];
    return colorScale(temp);
}

// Update color scale based on current month's temperature range
function updateColorScale() {
    // Collect all temperatures for the current month
    const temps = [];
    Object.values(temperatureData).forEach(county => {
        if (county.temps && county.temps[currentMonth] !== null) {
            temps.push(county.temps[currentMonth]);
        }
    });

    if (temps.length === 0) {
        // Fallback if no data
        colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([0, 100]);
        return;
    }

    // Calculate temperature range for this month
    const minTemp = d3.min(temps);
    const maxTemp = d3.max(temps);

    console.log(`Month ${monthNames[currentMonth]}: ${minTemp}°F to ${maxTemp}°F`);

    // Create color scale (blue = cold, red = hot)
    // Using reverse RdYlBu so red is hot and blue is cold
    colorScale = d3.scaleSequential()
        .domain([maxTemp, minTemp]) // Reversed domain for proper color mapping
        .interpolator(d3.interpolateRdYlBu);
}

// Update the legend gradient and labels
function updateLegend() {
    // Collect all temperatures for the current month
    const temps = [];
    Object.values(temperatureData).forEach(county => {
        if (county.temps && county.temps[currentMonth] !== null) {
            temps.push(county.temps[currentMonth]);
        }
    });

    const minTemp = Math.floor(d3.min(temps));
    const maxTemp = Math.ceil(d3.max(temps));

    // Create gradient
    const gradient = d3.select('#legend-gradient');
    const steps = 100;
    let gradientStr = 'linear-gradient(to right';

    for (let i = 0; i <= steps; i++) {
        const temp = minTemp + (maxTemp - minTemp) * (i / steps);
        const color = colorScale(temp);
        gradientStr += `, ${color}`;
    }
    gradientStr += ')';

    gradient.style('background', gradientStr);

    // Update labels
    const labels = d3.select('#legend-labels');
    labels.html(`
        <span>${minTemp}°F</span>
        <span>${Math.round((minTemp + maxTemp) / 2)}°F</span>
        <span>${maxTemp}°F</span>
    `);
}

// Update the map when month changes
function updateMap() {
    updateColorScale();

    d3.select('#map')
        .selectAll('.county')
        .transition()
        .duration(500)
        .attr('fill', d => getCountyColor(d));

    updateLegend();
}

// Setup event listeners
function setupEventListeners() {
    d3.select('#month-select').on('change', function() {
        currentMonth = +this.value;
        console.log(`Changed to ${monthNames[currentMonth]}`);
        updateMap();
    });
}

// Tooltip handlers
function handleMouseOver(event, d) {
    const tooltip = d3.select('#tooltip');
    tooltip.classed('visible', true);

    const fips = d.id;
    const countyData = temperatureData[fips];

    let content = `<div class="tooltip-fips">FIPS: ${fips}</div>`;

    if (countyData && countyData.temps && countyData.temps[currentMonth] !== null) {
        const temp = countyData.temps[currentMonth];
        content += `
            <div class="tooltip-temp">${temp}°F</div>
            <div style="margin-top: 4px; font-size: 13px;">${monthNames[currentMonth]} Average</div>
        `;
    } else {
        content += `<div class="tooltip-temp">No data</div>`;
    }

    tooltip.html(content);
}

function handleMouseMove(event) {
    const tooltip = d3.select('#tooltip');
    const tooltipNode = tooltip.node();
    const tooltipWidth = tooltipNode.offsetWidth;
    const tooltipHeight = tooltipNode.offsetHeight;

    let left = event.pageX + 15;
    let top = event.pageY - tooltipHeight / 2;

    // Keep tooltip in viewport
    if (left + tooltipWidth > window.innerWidth) {
        left = event.pageX - tooltipWidth - 15;
    }
    if (top < 10) {
        top = 10;
    }
    if (top + tooltipHeight > window.innerHeight) {
        top = window.innerHeight - tooltipHeight - 10;
    }

    tooltip
        .style('left', left + 'px')
        .style('top', top + 'px');
}

function handleMouseOut() {
    d3.select('#tooltip').classed('visible', false);
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // SVG with viewBox and preserveAspectRatio handles resize automatically
        console.log('Window resized');
    }, 250);
});

// Start the application
init();
