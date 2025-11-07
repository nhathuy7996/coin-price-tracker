export interface CoinPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  lastUpdate: string;
}

export interface CoinSearchResult {
  id: string;
  symbol: string;
  name: string;
}

export interface ElectronAPI {
  getCoinPrice: (symbol: string) => Promise<CoinPriceData | null>;
  setOpacity: (opacity: number) => Promise<boolean>;
  setCoinSymbol: (symbol: string) => Promise<CoinPriceData | null>;
  closeApp: () => void;
  minimizeApp: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  onPriceUpdate: (callback: (data: CoinPriceData | null) => void) => void;
  onSymbolChanged: (callback: (symbol: string) => void) => void;
  addCoinMapping: (symbol: string, coinGeckoId: string) => Promise<boolean>;
  getCustomMappings: () => Promise<{ [key: string]: string }>;
  searchCoin: (query: string) => Promise<CoinSearchResult[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
