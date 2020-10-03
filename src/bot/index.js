const {Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');

let chromeOptions = new chrome.Options;
chromeOptions.addArguments('disable-infobars');
chromeOptions.setUserPreferences({ credential_enable_service: false });

var Bot = async function( headless = true) {

  if ( headless == true )  {
    chromeOptions.addArguments('headless');
  }

  this.browser = await new Builder().setChromeOptions(chromeOptions).forBrowser('chrome').build();

  this.quit = async function() {
    return await this.browser.quit();
  };

  this.openUrl = async function(url) {
    return await this.browser.get(url);
  };

  this.findElementById = async function(id) {
    await this.browser.wait(until.elementLocated(By.id(id)), 1000, 'Looking for element');
    return await this.browser.findElement(By.id(id));
  };

  this.findElementByName = async function(name) {
    await this.browser.wait(until.elementLocated(By.name(name)), 1000, 'Looking for element');
    return await this.browser.findElement(By.name(name));
  };

  this.findElementByCss = async function(css) {
    await this.browser.wait(until.elementLocated(By.css(css)), 1000, 'Looking for element');
    return await this.browser.findElement(By.css(css));
  };

  this.findElementByClass = async function(eclass) {
    await this.browser.wait(until.elementLocated(By.className(eclass)), 1000, 'Looking for element');
    return await this.browser.findElement(By.className(eclass));
  };

  this.findElementByXpath = async function(xpath) {
    await this.browser.wait(until.elementLocated(By.xpath(xpath)), 1000, 'Looking for element');
    return await this.browser.findElement(By.xpath(xpath));
  };

  this.findElementsById = async function(id) {
    await this.browser.wait(until.elementLocated(By.id(id)), 1000, 'Looking for element');
    return await this.browser.findElements(By.id(id));
  };


  this.findElementsByCss = async function(css) {
    await this.browser.wait(until.elementLocated(By.css(css)), 1000, 'Looking for element');
    return await this.browser.findElements(By.css(css));
  };

  this.findElementsByClass = async function(eclass) {
    await this.browser.wait(until.elementLocated(By.className(eclass)), 1000, 'Looking for element');
    return await this.browser.findElements(By.className(eclass));
  };

  this.findElementsByXpath = async function(xpath) {
    await this.browser.wait(until.elementLocated(By.xpath(xpath)), 1000, 'Looking for element');
    return await this.browser.findElements(By.xpath(xpath));
  };

  this.autoType = async function (ele, value) {
    return await ele.sendKeys(value);
  };

};

module.exports = Bot;