// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');

require('chromedriver');
const {Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriverPath = require('chromedriver').path.replace('app.asar', 'app.asar.unpacked');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriverPath).build());

const crypto = require('crypto-js');
const fs = require('fs');
const { constants } = require('buffer');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + 'src/assets/img/icon.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('./index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
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
  if(!fs.existsSync(file)) {
    return false;
  } else {
    return true;
  }
}

async function openBrowser( headless = true ) {

  let chromeOptions = new chrome.Options;
  chromeOptions.addArguments('disable-infobars');
  chromeOptions.setUserPreferences({ credential_enable_service: false });

  if ( headless == true )  {
    chromeOptions.addArguments('headless');
  }

  let browser = await new Builder().setChromeOptions(chromeOptions).forBrowser('chrome').build();

  return browser;

}

async function closeBrowser(browser) {
  return await browser.quit();
}

async function locateElement(browser, type, value) {

  switch(type) {
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

  for (var i=0; i<cookie.length; i++ ) {
    if ( cookie[i].name == value) {
      return cookie[i].value;
    }
  }

}

function setUserInstagramSession(user, pass, cookie) {
  //let epass = encryptString(pass, "18112701121260147160");
  //let mid = encryptString(cookie[0].value, pass);
  // let ig_did = encryptString(cookie[1].value, pass);
  //let csrftoken = encryptString(cookie[2].value, pass);
  let time = Math.round(+new Date()/1000).toString();
  let filePath = 'user/cache/instagram/session.json';

  let userSession = {
    username: user,
    password: pass,
    s_mid: getCookieValue(cookie, 'mid'),
    s_ig_did: getCookieValue(cookie, 'ig_did'),
    s_csrftoken: getCookieValue(cookie, 'csrftoken'),
    s_shbid: getCookieValue(cookie, 'shbid'),
    s_shbts: getCookieValue(cookie, 'shbts'),
    s_sessionid: getCookieValue(cookie, 'sessionid'),
    s_ds_user_id: getCookieValue(cookie, 'ds_user_id'),
    time: time
  }

  let data = JSON.stringify(userSession);
  fs.writeFileSync(filePath, data);
}

function getUserInstagramSession() {

  let filePath = 'user/cache/instagram/session.json';

  if ( isFileExists(filePath) ) {
    let rawdata = fs.readFileSync(filePath);
    let session = JSON.parse(rawdata);
    return session;
  } else {
    return false;
  }
}

function sleep(seconds){
  var waitUntil = new Date().getTime() + seconds*1000;
  while(new Date().getTime() < waitUntil) true;
}

async function closeNotificationDialog(browser) {
  sleep(3);
  let ele = await getElement(browser, "css", "button.aOOlW.HoLwm");
  ele.click();
}

async function instagramLogin() {

  let isSaved = getUserInstagramSession();
  const browser = await openBrowser(false);
  
  if ( !isSaved ) {
    
  let url = 'https://www.instagram.com/accounts/login/';
  await openUrl(browser, url);

    let user = "";
    let pass = "";
    let inputs = 'form input';

    var element = await getElements(browser, 'css', inputs);

    await autoType(element[0], user);
    await autoType(element[1], pass+'\n').then(async function() {
      console.log('Login success');
      sleep(5);
      await openUrl(browser, "https://www.instagram.com/"+user+"/").then(function () {
        browser.manage().getCookies().then(function (cookies) {
          setUserInstagramSession(user, pass, cookies);
        }); 
      });

    });
  } else {

    await openUrl(browser,"https://www.instagram.com/"+isSaved['username']);

    await browser.manage().deleteCookie('mid');
    await browser.manage().deleteCookie('sessionid');
    await browser.manage().deleteCookie('ig_did');
    await browser.manage().deleteCookie('csrftoken');

    await browser.manage().addCookie({name:'ig_did', value: isSaved['s_ig_did'], 'sameSite': 'Strict'});
    await browser.manage().addCookie({name:'sessionid', value: isSaved['s_sessionid'], 'sameSite': 'Strict'});
    await browser.manage().addCookie({name:'ds_user_id', value: isSaved['s_ds_user_id'], 'sameSite': 'Strict'});
    await browser.manage().addCookie({name:'mid', value: isSaved['s_mid'], 'sameSite': 'Strict'});
    await browser.manage().addCookie({name:'csrftoken', value: isSaved['s_csrftoken'], 'sameSite': 'Strict'});

    sleep(5);
    await openUrl(browser, "https://www.instagram.com/");

    await closeNotificationDialog(browser);

  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  instagramLogin();
  createWindow();

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
