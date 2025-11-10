const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Store waste data in a simple file
const DATA_FILE = path.join(__dirname, 'waste-data.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

// Function 1: Add a new waste entry
ipcMain.handle('add-waste-entry', async (event, wasteData) => {
  try {
    let data = [];
    
    // Read existing data
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(fileData);
    }
    
    // Add new entry with timestamp
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: wasteData.type,
      amount: wasteData.amount,
      category: wasteData.category
    };
    
    data.push(newEntry);
    
    // Save back to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    return { success: true, entry: newEntry };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Function 2: Get today's waste statistics
ipcMain.handle('get-today-stats', async (event) => {
  try {
    let data = [];
    
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(fileData);
    }
    
    const today = new Date().toDateString();
    const todayEntries = data.filter(entry => {
      const entryDate = new Date(entry.date).toDateString();
      return entryDate === today;
    });
    
    // Calculate total waste for today
    const totalToday = todayEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    
    // Compare to average (2.2 kg per person)
    const averageWaste = 2.2;
    const comparison = totalToday - averageWaste;
    
    return {
      success: true,
      totalToday: totalToday.toFixed(2),
      comparison: comparison.toFixed(2),
      entryCount: todayEntries.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});