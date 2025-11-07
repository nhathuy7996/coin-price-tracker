# Coin Price Tracker - Installation Guide

## 📦 Download

Choose the appropriate version for your Mac:

- **`Coin Price Tracker-1.0.0-arm64.dmg`** (88 MB)
  - For Apple Silicon Macs (M1, M2, M3, M4)
  - Recommended for newer Macs (2020+)

- **`Coin Price Tracker-1.0.0.dmg`** (92 MB)
  - For Intel Macs
  - For older MacBooks and iMacs

## 🚀 Installation

### Step 1: Download the DMG file
Choose the right version based on your Mac's processor.

### Step 2: Open the DMG
Double-click the downloaded `.dmg` file to mount it.

### Step 3: Install
Drag **"Coin Price Tracker"** to the **Applications** folder.

### Step 4: Launch
1. Open **Applications** folder
2. Find **Coin Price Tracker**
3. Right-click → **Open** (first time only)
4. Click **Open** in the security dialog

## ⚠️ macOS Security Warning

Since the app is not signed with an Apple Developer certificate, macOS Gatekeeper will block it the first time.

### Solution 1: Right-click to Open
1. Right-click (or Control+click) on the app
2. Select **"Open"**
3. Click **"Open"** in the dialog

### Solution 2: System Settings
1. Try to open the app normally
2. Go to **System Settings** → **Privacy & Security**
3. Scroll down to **Security** section
4. Click **"Open Anyway"** next to the app message
5. Click **"Open"** when prompted

### Solution 3: Terminal Command (Advanced)
```bash
xattr -cr "/Applications/Coin Price Tracker.app"
```

Then open the app normally.

## ✨ Features

- 🔝 Always on top window
- 🎨 Adjustable transparency (30-100%)
- 💰 Real-time cryptocurrency prices
- 🔄 Auto-refresh every 2 minutes
- ➕ Add custom coins
- 🎯 Small, non-intrusive interface

## 📖 Usage

### Main Window
- **Coin Symbol Badge**: Click to open settings
- **⚙️ Button**: Open settings
- **− Button**: Minimize
- **× Button**: Quit app

### Settings Window
- **General Tab**:
  - Change coin symbol (BTC, ETH, SOL, etc.)
  - Adjust window opacity
  - Click "Apply Changes" to save

- **Add Coins Tab**:
  - Search for any cryptocurrency
  - Add new coins to track
  - Support for 10,000+ coins via CoinGecko

### Default Coins Supported
BTC, ETH, BNB, SOL, XRP, ADA, DOGE, WLD, TRX, LINK, UNI, ATOM, LTC, BCH, NEAR, APT, ARB, OP, SUI, TON, SHIB, PEPE, FTM, ALGO, and many more!

## 🔧 Uninstallation

1. Quit the app
2. Move **Coin Price Tracker.app** from Applications to Trash
3. Empty Trash

To remove settings:
```bash
rm -rf ~/Library/Application\ Support/coin-price-tracker
```

## 📊 System Requirements

- macOS 10.12 (Sierra) or later
- Internet connection for price updates
- ~100 MB disk space

## 🐛 Troubleshooting

### App won't open
- Make sure you followed the security steps above
- Try the terminal command to remove quarantine

### Prices not updating
- Check your internet connection
- CoinGecko API has rate limits (max ~30 requests/hour)
- App caches prices for 60 seconds

### App appears but is invisible
- Check opacity setting in Settings
- Reset by deleting app data and reinstalling

## 📝 Version

Current version: **1.0.0**

## 💬 Support

For issues or questions, check the project repository or documentation.

---

Enjoy tracking your crypto! 🚀
