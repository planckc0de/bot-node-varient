// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, MenuItem, shell, ipcMain, ipcRenderer, session } = require('electron');
const path = require('path');
const bot = require('planckbot');
//const ig = new bot.instagram(false);
const crypto = require('crypto-js');
const fs = require('fs');
const { constants } = require('buffer');
var sqlite3 = require('sqlite3');
const { callbackify } = require('util');
var db = new sqlite3.Database(path.join(__dirname, 'public/database/default.db'));

const myjsonclass = require('./public/util/myjson.js');
const myjsondir = './public/database/';
const myjson = new myjsonclass(myjsondir.toString());

let mainWindow

function removeFile(path) {
    if (isFileExists(path)) {
        fs.unlinkSync(path);
        return true;
    } else {
        return false;
    }
}

function createWindow(page) {

    var menu = Menu.buildFromTemplate([
        {
            label: 'Home',
            submenu: [
                {
                    label: 'Account',
                    submenu: [
                        {
                            role: 'Logout',
                            label: 'Logout',
                            click() {
                                userLogout()
                            }
                        }
                    ]
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    click() {
                        app.quit()
                    }
                }
            ]
        },
        {
            label: 'About',
            submenu: [
                { label: "What's new" },
                { label: "Check for update" }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: "Visit website",
                    click() {
                        shell.openExternal('https://product.planckstudio.in/bot')
                    }
                },
                {
                    label: "Email us",
                    click() {
                        shell.openExternal('mailto: bot@planckstudio.in')
                    }
                },
                {
                    label: "Support",
                    submenu: [
                        {
                            role: "Email",
                            label: "Email",
                            click() {
                                shell.openExternal('mailto: support@planckstudio.in')
                            }
                        },
                        {
                            role: "Instagram",
                            label: "Instagram",
                            click() {
                                shell.openExternal('https://instagram.com/plancksupport')
                            }
                        }
                    ]
                },
                {
                    label: "Follow us",
                    submenu: [
                        {
                            role: "Instagram",
                            label: "Instagram",
                            click() {
                                shell.openExternal('https://instagram.com/planck_bot')
                            }
                        },
                        {
                            role: "Facebook",
                            label: "Facebook"
                        }
                    ]
                },
                {
                    label: "Publisher",
                    submenu: [
                        {
                            role: "Website",
                            label: "Website",
                            click() {
                                shell.openExternal('https://planckstudio.in')
                            }
                        },
                        {
                            role: "Email",
                            label: "Email",
                            click() {
                                shell.openExternal('mailto: info@planckstudio.in')
                            }
                        },
                        {
                            role: "Instagram",
                            label: "Instagram",
                            click() {
                                shell.openExternal('https://instagram.com/planckstudio')
                            }
                        },
                        {
                            role: "Facebook",
                            label: "Facebook",
                            click() {
                                shell.openExternal('https://facebook.com/planckstudio')
                            }
                        },
                        ,
                        {
                            role: "Twitter",
                            label: "Twitter",
                            click() {
                                shell.openExternal('https://twitter.com/planckstudio')
                            }
                        },
                        ,
                        {
                            role: "Linkedin",
                            label: "Linkedin",
                            click() {
                                shell.openExternal('https://in.linkedin.com/company/planckstudio')
                            }
                        },
                        ,
                        {
                            role: "Github",
                            label: "Github",
                            click() {
                                shell.openExternal('https://github.com/planckstudio')
                            }
                        }

                    ]
                }
            ]
        }
    ])

    //Menu.setApplicationMenu(menu);

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1080,
        height: 1920,
        icon: path.join(__dirname, 'src/assets/img/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    switch (page) {
        case 'login':
            mainWindow.loadFile('public/login.html')
            break;
        default:
            mainWindow.loadFile('public/index.html')
            break;
    }

    // and load the index.html of the app.
    //mainWindow.loadFile('./index.html')

    // Open the DevTools.
    mainWindow.webContents.openDevTools()
}

function encryptString(text, pass) {
    return crypto.AES.encrypt(text, pass).toString();
}

function decryptString(text, pass) {
    const bytes = crypto.AES.decrypt(text, pass);
    const originalText = bytes.toString(crypto.enc.Utf8);
    return originalText;
}

function isFileExists(file) {
    if (!fs.existsSync(file)) {
        return false;
    } else {
        return true;
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    defaultSetup()

    if (myjson.readValue('flags', 'isLoginRequired')) {
        createWindow('login');
    } else {
        createWindow();
    }

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        ig.driver.quit();
        db.close();
        app.quit()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
/*
function getFlagValue(name) {
    let v;
    db.serialize(function () {
        let query = `select meta_value from bot where meta_name = ?`;
        db.get(query, [name], function (err, row) {
            v = row.meta_value;
        });
    });
    return v;
}

function setFlagValueWithCheck(name, val) {

    if (getFlagValue(name) != 'undefined') {

    }

    db.serialize(function () {
        let query = 'replace into bot(name, meta_name, meta_value) values(?,?,?)';
        var stmt = db.prepare(query);
        stmt.run(`flags`, name, val);
        stmt.finalize();
    });
}


function setFlagValue(name, val) {
    db.serialize(function () {
        let query = 'insert into bot(name, meta_name, meta_value) values(?,?,?)';
        var stmt = db.prepare(query);
        stmt.run(`flags`, name, val);
        stmt.finalize();
    });
}

function replaceFlagValue(name, val) {
    db.serialize(function () {
        let query = 'replace into bot(name, meta_name, meta_value) values(?,?,?)';
        var stmt = db.prepare(query);
        stmt.run(`flags`, name, val);
        stmt.finalize();
    });
}

function checkUserLogin() {

    let v = getFlagValue('currentUser');
    console.log(v);
    if (v) {
        console.log('yes');
    } else {
        console.log('no');
    }
}
*/
// App functions

function defaultSetup() {

    myjson.createTable('flags');
    myjson.createTable('session');
    myjson.createTable('user');

    db.serialize(function () {

        db.run("CREATE TABLE IF NOT EXISTS bot ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            + "name TEXT NOT NULL,"
            + "meta_name TEXT NOT NULL UNIQUE,"
            + "meta_value TEXT NULL DEFAULT NULL,"
            + "timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");

        db.run("CREATE TABLE IF NOT EXISTS user ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            + "username TEXT NULL DEFAULT NULL,"
            + "uid TEXT NULL DEFAULT NULL,"
            + "lid TEXT NULL DEFAULT NULL,"
            + "ltoken TEXT NULL DEFAULT NULL,"
            + "lsession TEXT NOT NULL)");

        db.run("CREATE TABLE IF NOT EXISTS session ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            + "name TEXT NOT NULL,"
            + "meta_name TEXT NOT NULL,"
            + "meta_value TEXT NULL DEFAULT NULL,"
            + "timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");

        db.run("CREATE TABLE IF NOT EXISTS instagram_users ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            + "username TEXT NOT NULL,"
            + "meta_name TEXT NOT NULL,"
            + "meta_value TEXT NULL DEFAULT NULL,"
            + "timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");

        db.run("CREATE TABLE IF NOT EXISTS instagram_medias ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            + "url TEXT NOT NULL,"
            + "meta_name TEXT NOT NULL,"
            + "meta_value TEXT NULL DEFAULT NULL,"
            + "timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");

        db.run("CREATE TABLE IF NOT EXISTS instagram_state ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            + "usernameTEXT NOT NULL,"
            + "meta_name TEXT NOT NULL,"
            + "meta_value TEXT NULL DEFAULT NULL,"
            + "timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");

        db.run("CREATE TABLE IF NOT EXISTS task ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            + "name TEXT NOT NULL,"
            + "meta_name TEXT NOT NULL,"
            + "meta_value TEXT NULL DEFAULT NULL,"
            + "timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,"
            + "start_time DATETIME NULL DEFAULT CURRENT_TIMESTAMP,"
            + "end_time DATETIME NULL DEFAULT NULL)");

        db.run("CREATE TABLE IF NOT EXISTS settings ("
            + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
            + "name TEXT NOT NULL,"
            + "meta_name TEXT NOT NULL,"
            + "meta_value TEXT NULL DEFAULT NULL,"
            + "timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
    });

    let flagData = {
        currentUser: null,
        isFirstLaunch: true,
        isInstagramConnected: false,
        isLoginRequired: true,
        status: true,
        where: true
    }

    let checkFlagJson = myjson.readValue('flags', 'status');

    if (!checkFlagJson) {
        myjson.insertValue('flags', flagData);
    } else {
        myjson.updateValue('flags', { "status": true }, { "isFirstLaunch": false });
    }
}

function userLogout() {
     myjson.deleteTable('flags');
    myjson.deleteTable('session');
    app.quit();
}

async function connectInstagramAccount() {
    let i = new bot.instagram(false);
    let mysession = await i.userLogin();
    myjson.insertValue('session', mysession);
    myjson.updateValue('flags', { "where": true }, { "isInstagramConnected": true });
    myjson.updateValue('session', { "type": "instagram" }, { "username": null });
    i.driver.quit();
}

// IPC Methods

ipcMain.on('logout-signal', function (event, arg) {
    if (arg) {
        userLogout()
    }
})

ipcMain.on('connect-instagram-signal', function (event, arg) {
    if (arg) {
        connectInstagramAccount();
    }
})

ipcMain.on('flagValue', function (event, arg) {
    console.log(arg);
})

ipcMain.on('set-flag-value', function (event, arg) {
    myjson.updateValue('flags', { "where": true }, arg);
})