import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { CoinService } from './services/coinService';

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let coinService: CoinService;

// Đường dẫn lưu custom mappings
const userDataPath = app.getPath('userData');
const customMappingsPath = path.join(userDataPath, 'custom-coin-mappings.json');

// Load custom mappings từ file
function loadCustomMappings(): { [key: string]: string } {
  try {
    if (fs.existsSync(customMappingsPath)) {
      const data = fs.readFileSync(customMappingsPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading custom mappings:', error);
  }
  return {};
}

// Save custom mappings vào file
function saveCustomMappings(mappings: { [key: string]: string }) {
  try {
    fs.writeFileSync(customMappingsPath, JSON.stringify(mappings, null, 2));
  } catch (error) {
    console.error('Error saving custom mappings:', error);
  }
}

// Khởi tạo coin service với custom mappings
coinService = new CoinService(loadCustomMappings());

// Cấu hình mặc định
const DEFAULT_CONFIG = {
  coinSymbol: 'BTC',
  opacity: 0.9,
  refreshInterval: 120000, // 120 giây (2 phút) - tăng để tránh rate limit
  width: 300,
  height: 200
};

function createWindow() {
  // Lấy kích thước màn hình
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: DEFAULT_CONFIG.width,
    height: DEFAULT_CONFIG.height,
    x: width - DEFAULT_CONFIG.width - 20,
    y: 20,
    frame: false, // Không có khung cửa sổ
    transparent: true, // Cho phép trong suốt
    alwaysOnTop: true, // Luôn nằm trên cùng
    resizable: false,
    skipTaskbar: true, // Không hiển thị trong taskbar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setOpacity(DEFAULT_CONFIG.opacity);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  // Bật DevTools trong development (có thể bỏ comment để debug)
  // mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Khởi động app
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Bắt đầu cập nhật giá
  startPriceUpdates();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-coin-price', async (_, symbol: string) => {
  try {
    return await coinService.getCoinPrice(symbol);
  } catch (error) {
    console.error('Error fetching coin price:', error);
    return null;
  }
});

ipcMain.handle('set-opacity', (_, opacity: number) => {
  if (mainWindow) {
    mainWindow.setOpacity(opacity);
    return true;
  }
  return false;
});

ipcMain.handle('set-coin-symbol', async (_, symbol: string) => {
  DEFAULT_CONFIG.coinSymbol = symbol.toUpperCase();
  // Lấy giá mới ngay lập tức
  const price = await coinService.getCoinPrice(DEFAULT_CONFIG.coinSymbol);
  
  // Cập nhật main window
  if (mainWindow && price) {
    mainWindow.webContents.send('price-update', price);
    mainWindow.webContents.send('symbol-changed', DEFAULT_CONFIG.coinSymbol);
  }
  
  return price;
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('minimize-app', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

// Open settings window
ipcMain.on('open-settings', () => {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  settingsWindow = new BrowserWindow({
    width: 400,
    height: 350,
    x: Math.floor((width - 400) / 2),
    y: Math.floor((height - 350) / 2),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    parent: mainWindow || undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  settingsWindow.loadFile(path.join(__dirname, '../public/settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
});

ipcMain.on('close-settings', () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
});

// Custom coin mapping handlers
ipcMain.handle('add-coin-mapping', async (_, symbol: string, coinGeckoId: string) => {
  try {
    coinService.addCoinMapping(symbol, coinGeckoId);
    const mappings = coinService.getCustomMappings();
    saveCustomMappings(mappings);
    return true;
  } catch (error) {
    console.error('Error adding coin mapping:', error);
    return false;
  }
});

ipcMain.handle('get-custom-mappings', () => {
  return coinService.getCustomMappings();
});

ipcMain.handle('search-coin', async (_, query: string) => {
  try {
    return await coinService.searchCoin(query);
  } catch (error) {
    console.error('Error searching coin:', error);
    return [];
  }
});

// Cập nhật giá tự động
let priceUpdateInterval: NodeJS.Timeout;

function startPriceUpdates() {
  // Lấy giá ngay lập tức
  updatePrice();

  // Sau đó cập nhật theo interval
  priceUpdateInterval = setInterval(() => {
    updatePrice();
  }, DEFAULT_CONFIG.refreshInterval);
}

async function updatePrice() {
  if (!mainWindow) return;

  try {
    const priceData = await coinService.getCoinPrice(DEFAULT_CONFIG.coinSymbol);
    mainWindow.webContents.send('price-update', priceData);
  } catch (error) {
    console.error('Error updating price:', error);
  }
}

app.on('before-quit', () => {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
  }
});
