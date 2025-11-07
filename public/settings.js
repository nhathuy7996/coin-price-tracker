// Settings window script

let currentSymbol = 'BTC';
let currentOpacity = 0.9;
let searchTimeout;

// DOM elements
const closeBtn = document.getElementById('closeBtn');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const coinInput = document.getElementById('coinInput');
const opacityRange = document.getElementById('opacityRange');
const opacityValue = document.getElementById('opacityValue');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const applyBtn = document.getElementById('applyBtn');

// Close button
closeBtn.addEventListener('click', () => {
  window.electronAPI.closeSettings();
});

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.getAttribute('data-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    tabContents.forEach(content => {
      if (content.id === targetTab) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  });
});

// Opacity slider
opacityRange.addEventListener('input', (e) => {
  const value = e.target.value;
  opacityValue.textContent = `${value}%`;
  currentOpacity = value / 100;
});

// Apply button
applyBtn.addEventListener('click', async () => {
  applyBtn.disabled = true;
  applyBtn.textContent = 'Applying...';
  
  // Apply opacity
  await window.electronAPI.setOpacity(currentOpacity);
  
  // Apply coin symbol if changed
  const newSymbol = coinInput.value.trim().toUpperCase();
  if (newSymbol && newSymbol !== currentSymbol) {
    currentSymbol = newSymbol;
    await window.electronAPI.setCoinSymbol(currentSymbol);
  }
  
  // Show success
  applyBtn.textContent = '✓ Applied';
  setTimeout(() => {
    applyBtn.disabled = false;
    applyBtn.textContent = 'Apply Changes';
  }, 1500);
});

// Coin input - remove auto change, only change on Apply
coinInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    applyBtn.click();
  }
});

// Search coin
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  if (query.length < 2) {
    searchResults.innerHTML = '<div class="empty-state">Type to search for coins...</div>';
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    searchResults.innerHTML = '<div class="empty-state">Searching...</div>';
    
    const results = await window.electronAPI.searchCoin(query);
    
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="empty-state">No coins found</div>';
      return;
    }
    
    searchResults.innerHTML = results.map(coin => `
      <div class="search-result-item" data-symbol="${coin.symbol}" data-id="${coin.id}">
        <div>
          <span class="search-result-symbol">${coin.symbol}</span>
          <span class="search-result-name">${coin.name}</span>
        </div>
        <span class="search-result-id">ID: ${coin.id}</span>
      </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', async () => {
        const symbol = item.getAttribute('data-symbol');
        const id = item.getAttribute('data-id');
        
        // Add mapping
        const success = await window.electronAPI.addCoinMapping(symbol, id);
        
        if (success) {
          // Set as current coin
          currentSymbol = symbol;
          coinInput.value = currentSymbol;
          await window.electronAPI.setCoinSymbol(currentSymbol);
          
          // Show success
          searchResults.innerHTML = `<div class="empty-state" style="color: #4ade80;">✓ Added ${symbol} - ${id}</div>`;
          searchInput.value = '';
          
          setTimeout(() => {
            searchResults.innerHTML = '<div class="empty-state">Type to search for coins...</div>';
          }, 2000);
        }
      });
    });
  }, 500);
});
