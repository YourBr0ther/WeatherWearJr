// Test script to verify OpenWeatherMap API
const API_KEY = process.env.OPENWEATHER_API_KEY || 'your_api_key_here';
const ZIP_CODE = '10001';

async function testAPI() {
  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${ZIP_CODE},US&appid=${API_KEY}&units=imperial`;
  
  console.log('Testing OpenWeatherMap API...');
  console.log('URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API Test Successful!');
      console.log('Location:', data.name);
      console.log('Temperature:', data.main.temp + '°F');
      console.log('Weather:', data.weather[0].description);
    } else {
      console.log('❌ API Error:', data.message);
      console.log('Make sure to add your OpenWeatherMap API key to .env.local');
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testAPI();