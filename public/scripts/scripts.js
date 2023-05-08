const toggleTemperature = document.getElementById('toggleTemperature');
const temperatureCell = document.querySelector('#weatherTable td:first-child');
const temperatureUnit = document.querySelector('.temp-unit');

toggleTemperature.addEventListener('click', () => {
  const currentTempCelsius = parseFloat(temperatureCell.dataset.celsius);
  const currentTempFahrenheit = parseFloat(temperatureCell.textContent);
  if (temperatureUnit.textContent === 'F') {
    const newTempCelsius = (currentTempFahrenheit - 32) * 5 / 9;
    temperatureCell.dataset.celsius = newTempCelsius.toFixed(1);
    temperatureCell.textContent = `${newTempCelsius.toFixed(1)} °C`;
    temperatureUnit.textContent = 'C';
  } else {
    const newTempFahrenheit = currentTempCelsius * 1.8 + 32;
    temperatureCell.dataset.celsius = currentTempCelsius.toFixed(1);
    temperatureCell.textContent = `${newTempFahrenheit.toFixed(1)} °F`;
    temperatureUnit.textContent = 'F';
  }
});