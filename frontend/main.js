// Chart.js is loaded via CDN in index.html

const API_BASE = 'http://localhost:3001/api';

// DOM Elements
const topRegionEl = document.getElementById('top-region');
const avgScoreEl = document.getElementById('avg-score');
const happinessChartCtx = document.getElementById('happinessChart').getContext('2d');
const predictForm = document.getElementById('predict-form');
const predictedScoreEl = document.getElementById('predicted-score');
const rangeInputs = document.querySelectorAll('input[type="range"]');

// Initialize
async function init() {
    setupEventListeners();
    const data = await fetchHappinessData();
    if (data && data.length > 0) {
        updateStats(data);
        renderChart(data);
    }
}

async function fetchHappinessData() {
    try {
        const response = await fetch(`${API_BASE}/data`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        topRegionEl.innerText = 'Error';
        avgScoreEl.innerText = 'Error';
    }
}

function updateStats(data) {
    // Top Region Calculation
    const regionScores = {};
    data.forEach(item => {
        if (!regionScores[item.region]) {
            regionScores[item.region] = { sum: 0, count: 0 };
        }
        regionScores[item.region].sum += item.happiness_score;
        regionScores[item.region].count += 1;
    });

    let topRegion = '';
    let maxAvg = 0;
    let totalSum = 0;

    for (const region in regionScores) {
        const avg = regionScores[region].sum / regionScores[region].count;
        if (avg > maxAvg) {
            maxAvg = avg;
            topRegion = region;
        }
        totalSum += regionScores[region].sum;
    }

    topRegionEl.innerText = topRegion;
    avgScoreEl.innerText = (totalSum / data.length).toFixed(2);
}

function renderChart(data) {
    // Prepare data for Chart - Top 20 countries
    const sortedData = [...data].sort((a, b) => b.happiness_score - a.happiness_score).slice(0, 20);

    new Chart(happinessChartCtx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item.country),
            datasets: [{
                label: 'Happiness Score',
                data: sortedData.map(item => item.happiness_score),
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#f8fafc' }
                }
            }
        }
    });
}

function setupEventListeners() {
    // Update displayed values for range inputs
    rangeInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.nextElementSibling.innerText = e.target.value;
        });
    });

    // Prediction Form Submission
    predictForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            economy: parseFloat(document.getElementById('economy').value),
            family: parseFloat(document.getElementById('family').value),
            health: parseFloat(document.getElementById('health').value),
            freedom: parseFloat(document.getElementById('freedom').value),
            trust: parseFloat(document.getElementById('trust').value),
            generosity: parseFloat(document.getElementById('generosity').value)
        };

        try {
            predictedScoreEl.innerText = '...';
            const response = await fetch(`${API_BASE}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            // Animation for the score
            animateValue(predictedScoreEl, 0, result.happiness_score, 1000);
        } catch (error) {
            console.error('Prediction error:', error);
            predictedScoreEl.innerText = 'Err';
        }
    });
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = (progress * (end - start) + start).toFixed(2);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', init);
