const electron = require('electron');
const url = require('url');
const path = require('path');

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = electron;

// Set Env
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to ready
app.on('ready', function () {
  // Create new window
  mainWindow = new BrowserWindow({});
  // Load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Quit app when closed
  mainWindow.on('closed', function () {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handel create add window
function createAddWindow() {
  // Create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 150,
    title: 'Add new note'
  });
  // Load html into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Garbage collection handle
  addWindow.on('closed', function () {
    addWindow = null;
  });
}

// Catch note:add
ipcMain.on('note:add', function(e, note) {
  mainWindow.webContents.send('note:add', note);
  addWindow.close();
})

// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Note',
        accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Notes',
        click() {
          mainWindow.webContents.send('note:clear')
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      },
    ]
  }
];

// If mac, add empty object to menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}

// Add eveloper tools if not in prod
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(note, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}