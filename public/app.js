const { app, BrowserWindow, Menu, MenuItem, shell, ipcRenderer } = require('electron');
const fs = require('fs');
const { constants } = require('buffer');
const path = require('path');
const $ = require("jquery");
const toastr = require("toastr");
const db = require('electron-db');
const dbPath = path.join(__dirname, 'data/');

var userApiToken = "NODTOS8C98VEDVIJ";
var userApiKey = "WNSdlsr0OZPzRlgl9i4YjTfhmE5vxQDceXMiPmUds0pcn4GAZRLksexIZ2xEbUE3";

function checkInputs(ele) {
    if (ele == "") {
        return false;
    } else {
        return true;
    }
}

$(document).ready(function () {

    toastr.options.preventDuplicates = true;

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
                        let time = Math.round(+new Date() / 1000).toString();

                        let userData = {
                            username: responce.username,
                            user_id: responce.user_id,
                            login_id: responce.login_id,
                            login_token: responce.login_token,
                            login_session: responce.login_session,
                            time: time,
                            status: true
                        }

                        if (db.valid('user', dbPath)) {
                            db.insertTableContent('user', dbPath, userData, (succ, msg) => {
                                console.log("Success: " + succ);
                                console.log("Message: " + msg);
                            })
                        }

                        $(location).attr('href', './index.html');
                    }
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