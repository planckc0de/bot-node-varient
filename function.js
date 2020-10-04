const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
let win = BrowserWindow.getFocusedWindow()

win.webContents.executeJavaScript("win.onload = (event) => { console.log('page is fully loaded again'); };");

win.onload = (event) => {
    console.log('page is fully loaded again');
};