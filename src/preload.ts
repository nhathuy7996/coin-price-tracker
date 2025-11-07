import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getCoinPrice: (symbol: string) => ipcRenderer.invoke('get-coin-price', symbol),
  setOpacity: (opacity: number) => ipcRenderer.invoke('set-opacity', opacity),
  setCoinSymbol: (symbol: string) => ipcRenderer.invoke('set-coin-symbol', symbol),
  closeApp: () => ipcRenderer.send('close-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  openSettings: () => ipcRenderer.send('open-settings'),
  closeSettings: () => ipcRenderer.send('close-settings'),
  onPriceUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('price-update', (_, data) => callback(data));
  },
  onSymbolChanged: (callback: (symbol: string) => void) => {
    ipcRenderer.on('symbol-changed', (_, symbol) => callback(symbol));
  },
  // Custom coin mapping functions
  addCoinMapping: (symbol: string, coinGeckoId: string) => 
    ipcRenderer.invoke('add-coin-mapping', symbol, coinGeckoId),
  getCustomMappings: () => ipcRenderer.invoke('get-custom-mappings'),
  searchCoin: (query: string) => ipcRenderer.invoke('search-coin', query)
});
