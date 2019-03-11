// Modules to control application life and create native browser window
const { app } = require('electron')
const mainWindow = require('./project/scripts/mainWindow');
require('electron-reload')(__dirname);

app.on('ready', mainWindow.createMainWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {

    if (mainWindow === null) {
        mainWindow.createMainWindow()
    }
})