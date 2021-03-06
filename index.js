/**
 * Amy is Awesome!
 */
'use strict';
const app = require('app');
const ipc = require('ipc');

const BrowserWindow = require('browser-window');
const Menu = require('menu');

const angular = require('./client/lib/ng-electron/ng-bridge');

require('electron-debug')({
    showDevTools: true
});

function createMainWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false
    });

    win.loadUrl(`file://${__dirname}/index.html`);
    win.on('closed', onClosed);

    return win;
}

function onClosed() {
    mainWindow = null;
}
// prevent window being GC'd
let mainWindow;

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate-with-no-open-windows', function() {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    }
});


app.on('ready', function() {
    mainWindow = createMainWindow();

    mainWindow.webContents.on('dom-ready', function(e) {
        //try and manually bootstrap AngularJS
        var code = "angular.bootstrap(document, ['app']);"
        mainWindow.webContents.executeJavaScript(code);
    });

    mainWindow.webContents.on('did-finish-load', function(e) {
        var menu = new Menu();
        var tpl = [{
            label: 'Electron test app',
        }, {
            label: 'Actions',
        }];
        menu = Menu.buildFromTemplate(tpl);
        Menu.setApplicationMenu(menu);

        //Start listening for client messages
        angular.listen(function(msg) {
            if (msg === 'getData') {
                var data = require('./data.json')
                angular.send(data);
            }
        });



    });
});