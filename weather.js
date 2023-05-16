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
            rain: oneCallResponse.data.current.rain ? (oneCallResponse.data.current.rain * 100) + '%' : 'No rain',
        };
        
        const dailyWeather = {
            description: oneCallResponse.data.daily[0].weather[0].description,
            rain: oneCallResponse.data.daily[0].rain ? (oneCallResponse.data.daily[0].rain * 100) + '%' : 'No rain',
            highTemp: (oneCallResponse.data.daily[0].temp.max * 9 / 5) + 32, // daily high temperature in Fahrenheit
            lowTemp: (oneCallResponse.data.daily[0].temp.min * 9 / 5) + 32, // daily low temperature in Fahrenheit
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

    const images = {
        outerwear: [],
        tops: [],
        bottoms: [],
        footwear: [],
    };

    const clothingImages = {
        'raincoat': '/images/raincoat.png',
        'light jacket': '/images/light_jacket.png',
        'heavy jacket': '/images/heavy_jacket.png',
        'warm sweater': '/images/warm_sweater.png',
        'long-sleeve shirt': '/images/long_sleeve_shirt.png',
        'short-sleeve shirt': '/images/short_sleeve_shirt.png',
        'pants': '/images/pants.png',
        'shorts': '/images/shorts.png',
        'rain boots': '/images/rain_boots.png',
        'closed-toe shoes': '/images/closed_toe_shoes.png',
        'sandals': '/images/sandals.png',
        'N/A': '/images/na.png', // Make sure to add this line
    };

    // Outerwear suggestions
    if (currentWeather.rain !== 'No rain') {
        recommendations.outerwear.push('raincoat');
        images.outerwear.push(clothingImages['raincoat']);
    } else if (currentWeather.temperature >= 0 && currentWeather.temperature < 10) {
        recommendations.outerwear.push('light jacket');
        images.outerwear.push(clothingImages['light jacket']);
    } else if (currentWeather.temperature < 0) {
        recommendations.outerwear.push('heavy jacket');
        images.outerwear.push(clothingImages['heavy jacket']);
    } else {
        recommendations.outerwear.push('N/A');
        images.outerwear.push(clothingImages['N/A']); // Add the 'N/A' image
    }

    // Tops suggestions
    if (currentWeather.temperature < 10) {
        recommendations.tops.push('warm sweater');
        images.tops.push(clothingImages['warm sweater']);
    } else if (currentWeather.temperature >= 10 && currentWeather.temperature < 20) {
        recommendations.tops.push('long-sleeve shirt');
        images.tops.push(clothingImages['long-sleeve shirt']);
    } else {
        recommendations.tops.push('short-sleeve shirt');
        images.tops.push(clothingImages['short-sleeve shirt']);
    }

    // Bottoms suggestions
    if (currentWeather.temperature < 15) {
        recommendations.bottoms.push('pants');
        images.bottoms.push(clothingImages['pants']);
    } else {
        recommendations.bottoms.push('shorts');
        images.bottoms.push(clothingImages['shorts']);
    }

    // Footwear suggestions
    if (currentWeather.rain !== 'No rain') {
        recommendations.footwear.push('rain boots');
        images.footwear.push(clothingImages['rain boots']);
    } else if (currentWeather.temperature < 15) {
        recommendations.footwear.push('closed-toe shoes');
        images.footwear.push(clothingImages['closed-toe shoes']);
    } else {
        recommendations.footwear.push('sandals');
        images.footwear.push(clothingImages['sandals']);
    }

    console.log('Clothing recommendations:', recommendations);
    console.log('Clothing images:', images);
    return { recommendations, images };
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
