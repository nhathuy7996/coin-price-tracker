import axios from 'axios';

export interface CoinPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  lastUpdate: string;
}

export class CoinService {
  private apiKey: string = ''; // Bạn có thể thêm API key từ CoinMarketCap nếu cần
  private baseUrl: string = 'https://api.coingecko.com/api/v3'; // Sử dụng CoinGecko API (miễn phí)
  
  // Cache để tránh gọi API quá nhiều
  private priceCache: Map<string, { data: CoinPriceData; timestamp: number }> = new Map();
  private cacheDuration: number = 60000; // Cache 60 giây

  // Map symbol sang CoinGecko ID (default mapping)
  private defaultSymbolToId: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'MATIC': 'matic-network',
    'DOT': 'polkadot',
    'AVAX': 'avalanche-2',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'WLD': 'worldcoin-wld',
    'TRX': 'tron',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'ATOM': 'cosmos',
    'LTC': 'litecoin',
    'BCH': 'bitcoin-cash',
    'NEAR': 'near',
    'APT': 'aptos',
    'ARB': 'arbitrum',
    'OP': 'optimism',
    'SUI': 'sui',
    'TON': 'the-open-network',
    'SHIB': 'shiba-inu',
    'PEPE': 'pepe',
    'FTM': 'fantom',
    'ALGO': 'algorand'
  };

  // Custom user mappings (được load từ main process)
  private customMappings: { [key: string]: string } = {};

  constructor(customMappings?: { [key: string]: string }) {
    if (customMappings) {
      this.customMappings = customMappings;
    }
  }

  // Merge default và custom mappings
  private get symbolToId(): { [key: string]: string } {
    return { ...this.defaultSymbolToId, ...this.customMappings };
  }

  async getCoinPrice(symbol: string): Promise<CoinPriceData | null> {
    try {
      const coinId = this.symbolToId[symbol.toUpperCase()] || symbol.toLowerCase();
      
      // Check cache first
      const cached = this.priceCache.get(coinId);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return {
          ...cached.data,
          lastUpdate: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })
        };
      }
      
      // Retry logic với exponential backoff
      let retries = 3;
      let delay = 1000; // Start with 1 second
      
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.get(
            `${this.baseUrl}/simple/price`,
            {
              params: {
                ids: coinId,
                vs_currencies: 'usd',
                include_24hr_change: true
              },
              timeout: 10000
            }
          );

          if (!response.data || !response.data[coinId]) {
            throw new Error(`Coin ${symbol} not found`);
          }

          const data = response.data[coinId];
          const priceData: CoinPriceData = {
            symbol: symbol.toUpperCase(),
            name: coinId,
            price: data.usd,
            change24h: data.usd_24h_change || 0,
            lastUpdate: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })
          };

          // Cache the result
          this.priceCache.set(coinId, {
            data: priceData,
            timestamp: Date.now()
          });

          return priceData;
        } catch (error: any) {
          // If it's a rate limit error (429), wait and retry
          if (error.response?.status === 429 && i < retries - 1) {
            console.log(`Rate limited, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
            continue;
          }
          throw error;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching coin price:', error);
      // Return cached data if available, even if expired
      const coinId = this.symbolToId[symbol.toUpperCase()] || symbol.toLowerCase();
      const cached = this.priceCache.get(coinId);
      if (cached) {
        console.log('Returning cached data due to error');
        return {
          ...cached.data,
          lastUpdate: `${new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} (cached)`
        };
      }
      return null;
    }
  }

  // Thêm coin mới vào danh sách custom
  addCoinMapping(symbol: string, coinGeckoId: string) {
    this.customMappings[symbol.toUpperCase()] = coinGeckoId;
  }

  // Lấy tất cả custom mappings
  getCustomMappings(): { [key: string]: string } {
    return { ...this.customMappings };
  }

  // Search coin by name trên CoinGecko API
  async searchCoin(query: string): Promise<Array<{ id: string; symbol: string; name: string }>> {
    try {
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: { query },
        timeout: 10000
      });

      return response.data.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name
      }));
    } catch (error) {
      console.error('Error searching coin:', error);
      return [];
    }
  }
}
