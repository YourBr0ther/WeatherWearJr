console.clear();
require('dotenv').config();
const { fetchWeatherData, suggestClothing } = require('./weather');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts/scripts.js', express.static(path.join(__dirname, 'public', 'scripts', 'scripts.js')));

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  const weatherData = await fetchWeatherData();
  const { recommendations, images, chanceOfRain } = suggestClothing(weatherData);
  res.render('index', { recommendations, images, weatherData });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
