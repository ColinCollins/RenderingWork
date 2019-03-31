const { BrowserWindow } = require('electron');

exports.createMainWindow = () => {
    // Create the browser window.
    this.mainWindow = new BrowserWindow({
        width: 1280,
        height: 960,
        minWidth: 800,
        minHeight: 640,
        resizable: false
    });
    console.log(__dirname);
    // and load the index.html of the app.
    this.mainWindow.loadFile(`${__dirname}/../index.html`);
    // open development tools
    this.mainWindow.webContents.openDevTools();

    this.mainWindow.on('closed', function () {
        console.log('MainWindow closed');
        this.mainWindow = null;
    })
}

exports.mainWindow;