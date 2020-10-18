const { app, BrowserWindow, Menu, MenuItem, shell, ipcRenderer, ipcMain } = require('electron');
const fs = require('fs');
const { constants } = require('buffer');
const path = require('path');
const $ = require("jquery");
const toastr = require("toastr");
const myjsonclass = require('./util/myjson.js');
const myjsondir = path.join(__dirname, 'database/');
const myjson = new myjsonclass(myjsondir);

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(path.join(__dirname, 'database/default.db'));

var userApiToken = "NODTOS8C98VEDVIJ";
var userApiKey = "WNSdlsr0OZPzRlgl9i4YjTfhmE5vxQDceXMiPmUds0pcn4GAZRLksexIZ2xEbUE3";

function checkInputs(ele) {
    if (ele == "") {
        return false;
    } else {
        return true;
    }
}

function getInstagramUserInfo(userid) {

    $.ajax({
        type: 'GET',
        url: 'https://api.planckstudio.in/bot/v1/getbasicinfo.php?userid=' + userid,
        dataType: 'json',
        success: function (responce) {
            if (responce.status == 'success') {
                myjson.updateValue('session', { "type": "instagram" }, { "username": responce.username });
            }
        },
        error: function () {
            console.log('Something goes wrong');
        }
    });
}

function connectInstagram() {
    ipcRenderer.send('connect-instagram-signal', true);
}

$(document).ready(function () {

    toastr.options.preventDuplicates = true;
    myjson.updateValue('flags', { "where": true }, { "isOnline": true });

    $('#login-btn').on('click', function (e) {

        e.preventDefault();
        e.stopImmediatePropagation();
        toastr.options.positionClass = 'toast-bottom-center';

        var username = $('input[name=auth_user]').val();
        var password = $('input[name=auth_pass]').val();

        if (username == "" || password == "") {
            toastr.warning('Enter username and password', 'Invalid input');
        } else {

            var requestData = {
                "apitoken": userApiToken,
                "apikey": userApiKey,
                "request": "login",
                "requestid": "testbot",
                "auth_username": username,
                "auth_password": password
            };

            $.ajax({
                type: 'POST',
                url: 'https://api.planckstudio.in/auth/v1/',
                data: requestData,
                dataType: 'json',
                success: function (responce) {

                    if (responce.status == "success") {

                        let userData = {
                            username: responce.username,
                            userId: responce.user_id,
                            loginId: responce.login_id,
                            loginToken: responce.login_token,
                            loginSession: responce.login_session,
                            status: true
                        }

                        myjson.insertValue('user', userData);

                        db.serialize(function () {
                            var stmt = db.prepare("INSERT INTO user(username, uid, lid, ltoken, lsession) VALUES (?, ?, ?, ?, ?)");
                            stmt.run(responce.username, responce.user_id, responce.login_id, responce.login_token, responce.login_session);
                            stmt.finalize();

                            ipcRenderer.send('set-flag-value', {
                                "isLoginRequired": false
                            });

                            ipcRenderer.send('set-flag-value', {
                                "currentUser": responce.user_id
                            });

                        });
                    }
                    $(location).attr('href', './index.html');
                },
                error: function () {
                    toastr.warning('Something goes wrong', 'Request failed');
                }
            });

        }
    });

    $('#register-btn').on('click', function (e) {

        e.preventDefault();
        e.stopImmediatePropagation();

        toastr.options.positionClass = 'toast-bottom-center';

        var username = $('input[name=auth_user]').val();
        var password = $('input[name=auth_pass]').val();
        var email = $('input[name=auth_email]').val();

        if (username == "" || password == "" || email == "") {
            toastr.warning('Enter all the details', 'Invalid input');
        } else {

            var requestData = {
                "apitoken": userApiToken,
                "apikey": userApiKey,
                "request": "register",
                "requestid": "testbot",
                "auth_username": username,
                "auth_password": password,
                "auth_email": email,
            };

            $.ajax({
                type: 'POST',
                url: 'https://api.planckstudio.in/auth/v1/',
                data: requestData,
                dataType: 'json',
                success: function (responce) {
                    if (responce.status == "success") {
                        $(location).attr('href', './login.html');
                    }
                },
                error: function (error) {
                    toastr.warning('Something goes wrong', 'Request failed');
                }
            });
        }
    });
});