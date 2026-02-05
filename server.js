const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

let happinessData = [];

// Load data on startup
fs.createReadStream('happiness_data.csv')
    .pipe(csv())
    .on('data', (row) => {
        // Process row data to ensure numbers are numbers
        const processedRow = {};
        for (const key in row) {
            const val = parseFloat(row[key]);
            processedRow[key] = isNaN(val) ? row[key] : val;
        }
        happinessData.push(processedRow);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });

// Routes
app.get('/api/data', (req, res) => {
    res.json(happinessData);
});

app.post('/api/predict', (req, res) => {
    const { economy, family, health, freedom, trust, generosity } = req.body;
    const score = 2.1 + (economy * 1.4) + (family * 1.1) + (health * 0.9) + (freedom * 0.7) + (trust * 0.6) + (generosity * 0.4);
    const finalScore = Math.min(Math.max(score, 0), 10);
    res.json({ happiness_score: finalScore.toFixed(3) });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
