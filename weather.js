require('dotenv').config();
const axios = require('axios');
const API_KEY = `${process.env.weatherAPI}`
const CITY = `${process.env.city}`
const UNITS = `${process.env.units}`

// Function to fetch weather data
async function fetchWeatherData() {
    try {
        // First, get the coordinates of the city
        const cityUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}`;
        const cityResponse = await axios.get(cityUrl);
        const { lat, lon } = cityResponse.data.coord;

        // Then, get the One Call API data using the coordinates
        const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=${UNITS}&appid=${API_KEY}`;
        const oneCallResponse = await axios.get(oneCallUrl);

        const currentWeather = {
            temperatureC: oneCallResponse.data.current.temp,
            temperatureF: (oneCallResponse.data.current.temp * 9 / 5) + 32,
            description: oneCallResponse.data.current.weather[0].description,
            rain: oneCallResponse.data.current.rain || 'No rain',
        };

        const dailyWeather = {
            description: oneCallResponse.data.daily[0].weather[0].description,
            rain: oneCallResponse.data.daily[0].rain || 'No rain',
        };

        const weatherData = {
            city: CITY,
            currentWeather,
            dailyWeather,
            timestamp: new Date(),
        };

        console.log('Weather data:', JSON.stringify(weatherData));
        return weatherData;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return null;
    }
}

// Function to suggest clothing options based on the weather data
function suggestClothing(weatherData) {
    const { currentWeather, dailyWeather } = weatherData;

    const recommendations = {
        outerwear: [],
        tops: [],
        bottoms: [],
        footwear: [],
    };

    // Outerwear suggestions
    if (currentWeather.rain !== 'No rain') {
        recommendations.outerwear.push('raincoat');
    } else if (currentWeather.temperature >= 0 && currentWeather.temperature < 10) {
        recommendations.outerwear.push('light jacket');
    } else if (currentWeather.temperature < 0) {
        recommendations.outerwear.push('heavy jacket');
    }

    // Tops suggestions
    if (currentWeather.temperature < 10) {
        recommendations.tops.push('warm sweater');
    } else if (currentWeather.temperature >= 10 && currentWeather.temperature < 20) {
        recommendations.tops.push('long-sleeve shirt');
    } else {
        recommendations.tops.push('short-sleeve shirt');
    }

    // Bottoms suggestions
    if (currentWeather.temperature < 15) {
        recommendations.bottoms.push('pants');
    } else {
        recommendations.bottoms.push('shorts');
    }

    // Footwear suggestions
    if (currentWeather.rain !== 'No rain') {
        recommendations.footwear.push('rain boots');
    } else if (currentWeather.temperature < 15) {
        recommendations.footwear.push('closed-toe shoes');
    } else {
        recommendations.footwear.push('sandals');
    }

    console.log('Clothing recommendations:', recommendations);
    return recommendations;
}

// Fetch weather data every hour and suggest clothing options
setInterval(async () => {
    const weatherData = await fetchWeatherData();
    console.log('[Initial Fetch] Weather data:', JSON.stringify(weatherData));
    suggestClothing(weatherData);
    
}, 60 * 60 * 1000); // 60 minutes * 60 seconds * 1000 milliseconds

// Fetch weather data and suggest clothing options once when the application starts
(async () => {
    const weatherData = await fetchWeatherData();
    console.log('[Hourly Update] Weather data:', JSON.stringify(weatherData));
    suggestClothing(weatherData);
    
})();

module.exports = {
    fetchWeatherData,
    suggestClothing
};
