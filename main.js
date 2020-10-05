// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, MenuItem, shell, ipcMain, ipcRenderer } = require('electron');
const path = require('path');
const db = require('electron-db');
const dbPath = path.join(__dirname, 'public/data/');

require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriverPath = require('chromedriver').path.replace('app.asar', 'app.asar.unpacked');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriverPath).build());

const crypto = require('crypto-js');
const fs = require('fs');
const { constants } = require('buffer');

const userDataJson = path.join(__dirname, 'public/user/cache/data.json');

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

async function openBrowser(headless = true) {

    let chromeOptions = new chrome.Options;
    chromeOptions.addArguments('disable-infobars');
    chromeOptions.setUserPreferences({ credential_enable_service: false });

    if (headless == true) {
        chromeOptions.addArguments('headless');
    }

    let browser = await new Builder().setChromeOptions(chromeOptions).forBrowser('chrome').build();

    return browser;

}

async function closeBrowser(browser) {
    return await browser.quit();
}

async function locateElement(browser, type, value) {

    switch (type) {
        case 'css':
            await browser.wait(until.elementLocated(By.css(value)), 30000, 'Looking for element');
            break;
        case 'id':
            await browser.wait(until.elementLocated(By.id(value)), 30000, 'Looking for element');
            break;
        case 'name':
            await browser.wait(until.elementLocated(By.name(value)), 30000, 'Looking for element');
            break;
        case 'class':
            await browser.wait(until.elementLocated(By.className(value)), 30000, 'Looking for element');
            break;
        case 'xpath':
            await browser.wait(until.elementLocated(By.className(value)), 3000, 'Looking for element');
            break;
    }

}

async function getElement(browser, type, value) {

    await locateElement(browser, type, value);

    switch (type) {
        case 'css':
            return await browser.findElement(By.css(value));
        case 'id':
            return await browser.findElement(By.id(value));
        case 'name':
            return await browser.findElement(By.name(value));
        case 'class':
            return await browser.findElement(By.className(value));
        case 'xpath':
            return await browser.findElement(By.xpath(value));
    }

}

async function getElements(browser, type, value) {

    await locateElement(browser, type, value);

    switch (type) {
        case 'css':
            return await browser.findElements(By.css(value));
        case 'class':
            return await browser.findElements(By.className(value));
        case 'xpath':
            return await browser.findElements(By.xpath(value));
    }
}

async function autoType(ele, value) {
    return await ele.sendKeys(value);
}

async function openUrl(browser, url) {
    return await browser.get(url);
}

function getCookieValue(cookie, value) {

    for (var i = 0; i < cookie.length; i++) {
        if (cookie[i].name == value) {
            return cookie[i].value;
        }
    }

}

function setUserInstagramSession(user, pass, cookie) {
    //let epass = encryptString(pass, "18112701121260147160");
    //let mid = encryptString(cookie[0].value, pass);
    // let ig_did = encryptString(cookie[1].value, pass);
    //let csrftoken = encryptString(cookie[2].value, pass);
    let time = Math.round(+new Date() / 1000).toString();

    let userSession = {
        username: user,
        password: pass,
        s_mid: getCookieValue(cookie, 'mid'),
        s_ig_did: getCookieValue(cookie, 'ig_did'),
        s_csrftoken: getCookieValue(cookie, 'csrftoken'),
        s_sessionid: getCookieValue(cookie, 'sessionid'),
        s_ds_user_id: getCookieValue(cookie, 'ds_user_id'),
        time: time,
        status: true
    }

    if (db.valid('instagram', dbPath)) {
        db.insertTableContent('instagram', dbPath, userSession, (succ, msg) => {
            if (succ) {
                ipcRenderer.send('is-instagram-connected', true);
            }
        })
    }
}

function getUserInstagramSession() {

    let session;

    if (db.valid('instagram', dbPath)) {
        const key = 'status';

        session = false;

        db.getField('instagram', dbPath, key, (succ, data) => {
            if (succ) {
                if (data[0] == true) {
                    let rawdata = fs.readFileSync(dbPath+'instagram.json');
                    session = JSON.parse(rawdata);
                } 
            }
        })
    }

    return session;
}

function sleep(seconds) {
    var waitUntil = new Date().getTime() + seconds * 1000;
    while (new Date().getTime() < waitUntil) true;
}

async function closeNotificationDialog(browser) {
    sleep(3);
    let ele = await getElement(browser, "css", "button.aOOlW.HoLwm");
    ele.click();
}

async function connectInstagramAccount() {

    const browser = await openBrowser(false);
    let url = 'https://www.instagram.com/accounts/login/';

    await openUrl(browser, url).then(function () {
        let user;
        let pass;

        var up = setInterval(async function () {
            let inputs = 'form input';
            var element = await getElements(browser, 'css', inputs);

            element[0].getAttribute("value").then(function (value) {
                user = value;
            });

            element[1].getAttribute("value").then(function (value) {
                pass = value;
            });

        }, 1000);

        browser.wait(until.titleIs('Instagram')).then(function () {
            clearInterval(up)
            browser.manage().getCookies().then(async function (cookies) {
                setUserInstagramSession(user, pass, cookies);
                await closeBrowser(browser);
                app.relaunch()
                app.quit()
            });
        });
    });

}

async function instagramLogin() {

    let isSaved = getUserInstagramSession();
    const browser = await openBrowser(false);

    if (!isSaved) {

        let url = 'https://www.instagram.com/accounts/login/';
        await openUrl(browser, url);

        let user = "";
        let pass = "";
        let inputs = 'form input';

        var element = await getElements(browser, 'css', inputs);

        await autoType(element[0], user);
        await autoType(element[1], pass + '\n').then(async function () {
            console.log('Login success');
            sleep(5);
            await openUrl(browser, "https://www.instagram.com/" + user + "/").then(function () {
                browser.manage().getCookies().then(function (cookies) {
                    setUserInstagramSession(user, pass, cookies);
                });
            });

        });
    } else {

        await openUrl(browser, "https://www.instagram.com/" + isSaved['instagram'][0].username);

        await browser.manage().deleteCookie('mid');
        await browser.manage().deleteCookie('sessionid');
        await browser.manage().deleteCookie('ig_did');
        await browser.manage().deleteCookie('csrftoken');

        await browser.manage().addCookie({ name: 'ig_did', value: isSaved['instagram'][0].s_ig_did, 'sameSite': 'Strict' });
        await browser.manage().addCookie({ name: 'sessionid', value: isSaved['instagram'][0].s_sessionid, 'sameSite': 'Strict' });
        await browser.manage().addCookie({ name: 'ds_user_id', value: isSaved['instagram'][0].s_ds_user_id, 'sameSite': 'Strict' });
        await browser.manage().addCookie({ name: 'mid', value: isSaved['instagram'][0].s_mid, 'sameSite': 'Strict' });
        await browser.manage().addCookie({ name: 'csrftoken', value: isSaved['instagram'][0].s_csrftoken, 'sameSite': 'Strict' });

        sleep(5);
        await openUrl(browser, "https://www.instagram.com/");
        await closeNotificationDialog(browser);

    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    defaultSetup();
    let isLogin = checkUserLogin();

    if (!isLogin) {
        createWindow('login');
    } else {
        createWindow();
    }

    //instagramLogin();

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
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function checkUserLogin() {

    let res = false;

    if (db.valid('user', dbPath)) {
        const key = 'status';

        db.getField('user', dbPath, key, (succ, data) => {
            if (succ) {
                if (data[0] == true) {
                    res = true;
                }
            }
        })
    }
    return res;
}

// App functions

function defaultSetup() {

    if (!db.tableExists('user', dbPath)) {
        db.createTable('user', dbPath, (succ, msg) => {
            if (succ) {
                console.log(msg)
            } else {
                console.log('An error has occured. ' + msg)
            }
        })
    }

    if (!db.tableExists('instagram', dbPath)) {
        db.createTable('instagram', dbPath, (succ, msg) => {
            if (succ) {
                console.log(msg)
            } else {
                console.log('An error has occured. ' + msg)
            }
        })
    }

    if (!db.tableExists('setting', dbPath)) {
        db.createTable('setting', dbPath, (succ, msg) => {
            if (succ) {
                console.log(msg)
            } else {
                console.log('An error has occured. ' + msg)
            }
        })
    }
}

function userLogout() {

    db.clearTable('instagram', dbPath, (succ, msg) => {
        //
    })

    db.clearTable('setting', dbPath, (succ, msg) => {
        //
    })

    db.clearTable('user', dbPath, (succ, msg) => {
        if (succ) {
            app.quit();
        }
    })
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