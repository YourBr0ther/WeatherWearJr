require('dotenv').config();
const axios = require('axios');
const API_KEY = `${process.env.weatherAPI}`
const CITY = `${process.env.city}`
const UNITS = `${process.env.units}`

async function fetchWeatherData() {
    try {
        const cityUrl = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}`;
        const cityResponse = await axios.get(cityUrl);
        const { lat, lon } = cityResponse.data.coord;

        const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=${UNITS}&appid=${API_KEY}`;
        const oneCallResponse = await axios.get(oneCallUrl);

        const currentWeather = {
            temperatureF: (oneCallResponse.data.current.temp * 9 / 5) + 32,
            description: oneCallResponse.data.current.weather[0].description,
            rain: oneCallResponse.data.current.rain ? (oneCallResponse.data.current.rain['1h'] * 100) + '%' : 'No rain',
        };

        const highTemp = (oneCallResponse.data.daily[0].temp.max * 9 / 5) + 32;
        const lowTemp = (oneCallResponse.data.daily[0].temp.min * 9 / 5) + 32;

        const dailyWeather = {
            highTemp: highTemp,
            lowTemp: lowTemp,
            hourlyForecast: oneCallResponse.data.hourly.map(hourlyData => ({
                precipitation: hourlyData.precipitation ? hourlyData.precipitation['1h'] : 0
            }))
        };

        let totalRainyHours = 0;
        for (const hourly of dailyWeather.hourlyForecast) {
            if (hourly.precipitation > 0) {
                totalRainyHours++;
            }
        }

        const chanceOfRain = totalRainyHours > 0 ? (totalRainyHours / dailyWeather.hourlyForecast.length) * 100 : 0;
        const weatherData = {
            city: CITY,
            currentWeather,
            dailyWeather,
            chanceOfRain,
            timestamp: new Date(),
            highTemp,
            lowTemp
        };

        return weatherData;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return null;
    }
}

function suggestClothing(weatherData) {
    const { highTemp, lowTemp, chanceOfRain } = weatherData;

    const recommendations = {
        outerwear: [],
        tops: [],
        bottoms: [],
        shoes: [],
    };

    const images = {
        outerwear: [],
        tops: [],
        bottoms: [],
        shoes: [],
    };

    const clothingImages = {
        'no jacket': '/images/no_jacket.png',
        'raincoat': '/images/raincoat.png',
        'light jacket': '/images/light_jacket.png',
        'heavy jacket': '/images/heavy_jacket.png',
        'long-sleeve shirt': '/images/long_sleeve_shirt.png',
        'short-sleeve shirt': '/images/short_sleeve_shirt.png',
        'pants': '/images/pants.png',
        'shorts': '/images/shorts.png',
        'tennis shoes': '/images/tennis_shoes.png',
        'rain boots': '/images/rain_boots.png',
        'N/A': '/images/na.png'
    };

    if (highTemp > 75 && lowTemp > 65) {
        if (chanceOfRain > 50) {
            recommendations.outerwear.push('raincoat');
            recommendations.tops.push('short-sleeve shirt');
            recommendations.bottoms.push('shorts');
            recommendations.shoes.push('rain boots');
        } else {
            recommendations.outerwear.push('no jacket');
            recommendations.tops.push('short-sleeve shirt');
            recommendations.bottoms.push('shorts');
            recommendations.shoes.push('tennis shoes');
        }
    } else if (highTemp <= 75 && lowTemp <= 65 && highTemp > 60 && lowTemp > 50) {
        if (chanceOfRain > 50) {
            recommendations.outerwear.push('raincoat');
            recommendations.tops.push('short-sleeve shirt');
            recommendations.bottoms.push('shorts');
            recommendations.shoes.push('rain boots');
        } else {
            recommendations.outerwear.push('light jacket');
            recommendations.tops.push('short-sleeve shirt');
            recommendations.bottoms.push('shorts');
            recommendations.shoes.push('tennis shoes');
        }
    } else if (highTemp <= 60 && lowTemp <= 50 && highTemp > 45 && lowTemp > 35) {
        if (chanceOfRain > 50) {
            recommendations.outerwear.push('raincoat');
            recommendations.tops.push('long-sleeve shirt');
            recommendations.bottoms.push('pants');
            recommendations.shoes.push('rain boots');
        } else {
            recommendations.outerwear.push('light jacket');
            recommendations.tops.push('long-sleeve shirt');
            recommendations.bottoms.push('pants');
            recommendations.shoes.push('tennis shoes');
        }
    } else if (highTemp <= 45 && lowTemp <= 35) {  // updated threshold for heavy jacket
        if (chanceOfRain > 50) {
            recommendations.outerwear.push('raincoat');
            recommendations.tops.push('long-sleeve shirt');
            recommendations.bottoms.push('pants');
            recommendations.shoes.push('rain boots');
        } else {
            recommendations.outerwear.push('heavy jacket');
            recommendations.tops.push('long-sleeve shirt');
            recommendations.bottoms.push('pants');
            recommendations.shoes.push('tennis shoes');
        }

    }

    recommendations.outerwear.forEach((item, index) => {
        images.outerwear.push(clothingImages[item]);
    });
    recommendations.tops.forEach((item, index) => {
        images.tops.push(clothingImages[item]);
    });
    recommendations.bottoms.forEach((item, index) => {
        images.bottoms.push(clothingImages[item]);
    });
    recommendations.shoes.forEach((item, index) => {
        images.shoes.push(clothingImages[item]);
    });

    return { recommendations, images };

}
setInterval(async () => {
    const weatherData = await fetchWeatherData();
        suggestClothing(weatherData);

}, 60 * 60 * 1000);

fetchWeatherData()
    .then(weatherData => {
        suggestClothing(weatherData);
    });

module.exports = {
    fetchWeatherData,
    suggestClothing
};