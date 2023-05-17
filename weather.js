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
            rain: oneCallResponse.data.current.rain ? (oneCallResponse.data.current.rain['1h'] * 100) + '%' : 'No rain',
        };

        // Get the high and low temperature for the day
        const highTemp = oneCallResponse.data.daily[0].temp.max;
        const lowTemp = oneCallResponse.data.daily[0].temp.min;

        const dailyWeather = {
            highTemp: (highTemp * 9 / 5) + 32,  // Convert high temperature to Fahrenheit
            lowTemp: (lowTemp * 9 / 5) + 32,
            hourlyForecast: oneCallResponse.data.hourly.map(hourlyData => ({
                precipitation: hourlyData.precipitation ? hourlyData.precipitation['1h'] : 0
            }))
        };

        // Calculate the chance of rain
        let totalRainyHours = 0;

        // Iterate through the daily weather data
        for (const hourly of dailyWeather.hourlyForecast) {
            if (hourly.precipitation > 0) {
                totalRainyHours++;
            }
        }

        const chanceOfRain = totalRainyHours > 0 ? (totalRainyHours / dailyWeather.hourlyForecast.length) * 100 : 0;

        console.log('Total Rainy Hours:', totalRainyHours);
        console.log('Chance of Rain:', chanceOfRain + '%');

        const weatherData = {
            city: CITY,
            currentWeather,
            dailyWeather,
            chanceOfRain,
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
    const { currentWeather, chanceOfRain } = weatherData;

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
        'N/A': '/images/na.png'
    };

    // Outerwear suggestions
    if (chanceOfRain > 50) {
        recommendations.outerwear.push('raincoat');
        images.outerwear.push(clothingImages['raincoat']);
    } else if (currentWeather.temperatureC >= 0 && currentWeather.temperatureC < 10) {
        recommendations.outerwear.push('light jacket');
        images.outerwear.push(clothingImages['light jacket']);
    } else if (currentWeather.temperatureC < 0) {
        recommendations.outerwear.push('heavy jacket');
        images.outerwear.push(clothingImages['heavy jacket']);
    } else {
        recommendations.outerwear.push('N/A');
        images.outerwear.push(clothingImages['N/A']);
    }

    // Tops suggestions
    if (chanceOfRain > 50) {
        recommendations.tops.push('raincoat');
        images.tops.push(clothingImages['raincoat']);
    } else if (currentWeather.temperatureC < 10) {
        recommendations.tops.push('warm sweater');
        images.tops.push(clothingImages['warm sweater']);
    } else if (currentWeather.temperatureC >= 10 && currentWeather.temperatureC < 20) {
        recommendations.tops.push('long-sleeve shirt');
        images.tops.push(clothingImages['long-sleeve shirt']);
    } else {
        recommendations.tops.push('short-sleeve shirt');
        images.tops.push(clothingImages['short-sleeve shirt']);
    }

    // Bottoms suggestions
    if (chanceOfRain > 50) {
        recommendations.bottoms.push('raincoat');
        images.bottoms.push(clothingImages['raincoat']);
    } else if (currentWeather.temperatureC < 15) {
        recommendations.bottoms.push('pants');
        images.bottoms.push(clothingImages['pants']);
    } else {
        recommendations.bottoms.push('shorts');
        images.bottoms.push(clothingImages['shorts']);
    }

    // Footwear suggestions
    if (chanceOfRain > 50) {
        recommendations.footwear.push('rain boots');
        images.footwear.push(clothingImages['rain boots']);
    } else {
        recommendations.footwear.push('closed-toe shoes');
        images.footwear.push(clothingImages['closed-toe shoes']);
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

fetchWeatherData()
    .then(weatherData => {
        const clothingSuggestions = suggestClothing(weatherData);
        console.log(clothingSuggestions);
    });

module.exports = {
    fetchWeatherData,
    suggestClothing
};