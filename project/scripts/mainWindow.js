const { BrowserWindow } = require('electron');

exports.createMainWindow = () => {
    // Create the browser window.
    this.mainWindow = new BrowserWindow({
        width: 1280,
        height: 960,
        minWidth: 800,
        minHeight: 640
    });

    this.mainWindow.openDevTool();
    // and load the index.html of the app.
    this.mainWindow.loadFile(`File://${__dirname}/project/index.html`);

    this.mainWindow.on('closed', function () {
        console.log('MainWindow closed');
        this.mainWindow = null;
    })
}

exports.mainWindow;