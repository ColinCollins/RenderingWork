// Modules to control application life and create native browser window
const { app, ipcMain } = require('electron');
const mainWindow = require('./project/scripts/mainWindow');
// nodejs module only could use in the mainjs
const fs = require('fs');

/* require('electron-reload')(__dirname); */

app.on('ready', mainWindow.createMainWindow);

ipcMain.on('init-success', (e) => {
    let vshaderSource = fs.readFileSync(`${__dirname}/project/glsl/vertexShader.glsl`, { encoding: 'utf8' });
    let fshaderSource = fs.readFileSync(`${__dirname}/project/glsl/fragmentShader.glsl`, { encoding: 'utf8' });

    e.sender.send('load shader source', {
        vshaderSource: vshaderSource,
        fshaderSource: fshaderSource
    });

    console.log('send source to render');
})

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