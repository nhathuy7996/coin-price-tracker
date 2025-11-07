// Type declarations for TypeScript
/// <reference types="../types/electron-api" />

let currentSymbol = 'BTC';

// DOM elements
const priceEl = document.getElementById('price');
const changeEl = document.getElementById('change');
const changeValueEl = document.getElementById('changeValue');
const lastUpdateEl = document.getElementById('lastUpdate');
const coinSymbolEl = document.getElementById('coinSymbol');

// Control buttons
document.getElementById('closeBtn').addEventListener('click', () => {
  window.electronAPI.closeApp();
});

document.getElementById('minimizeBtn').addEventListener('click', () => {
  window.electronAPI.minimizeApp();
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  window.electronAPI.openSettings();
});

// Coin symbol click to open settings
coinSymbolEl.addEventListener('click', () => {
  window.electronAPI.openSettings();
});

// Listen for price updates from main process
window.electronAPI.onPriceUpdate((priceData) => {
  if (priceData) {
    updatePriceDisplay(priceData);
  }
});

// Listen for symbol changes from settings
window.electronAPI.onSymbolChanged((symbol) => {
  currentSymbol = symbol;
  coinSymbolEl.textContent = symbol;
});

// Update price display
function updatePriceDisplay(data) {
  if (!data) return;

  // Format price
  let formattedPrice;
  if (data.price >= 1) {
    formattedPrice = `$${data.price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } else if (data.price >= 0.01) {
    formattedPrice = `$${data.price.toFixed(4)}`;
  } else {
    formattedPrice = `$${data.price.toFixed(6)}`;
  }

  priceEl.textContent = formattedPrice;

  // Format change
  const changeValue = data.change24h;
  const isPositive = changeValue >= 0;
  
  changeEl.className = isPositive ? 'change positive' : 'change negative';
  changeValueEl.textContent = `${isPositive ? '↗' : '↘'} ${Math.abs(changeValue).toFixed(2)}%`;

  // Update timestamp
  lastUpdateEl.textContent = `Updated: ${data.lastUpdate}`;
}

// Initial load
(async () => {
  const initialPrice = await window.electronAPI.getCoinPrice(currentSymbol);
  if (initialPrice) {
    updatePriceDisplay(initialPrice);
  }
})();
