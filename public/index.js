$(document).ready(function () {

    $(window).scrollTop(0);

    renderProfile();

    toastr.options.positionClass = 'toast-bottom-right';

    $('#instagram-btn').on('click', function () {
        connectInstagram();
    });

    $('#logout-btn').on('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toastr.info('Logout process start');
        ipcRenderer.send('logout-signal', true);
    });

});

function openSection(ele) {
    $('.section').removeClass('sec-visible').addClass('sec-hidden');
    $(ele).removeClass('sec-hidden').addClass('sec-visible');
}

function renderConnectInstagram() {
    if (!isInstagramConnected()) {
        $('#connect-instagram').removeClass('sec-remove');
    }
}

function setInstagramUserInfo() {
    var requestData = {
        "username": getInstagramUsername()
    };

    $.ajax({
        type: 'GET',
        url: 'https://api.planckstudio.in/bot/v1/curlbasic.php',
        data: requestData,
        dataType: 'json',
        success: function (responce) {
            $('#user-ig-name').text(responce.name);
            $('#user-ig-username').text(responce.username);
            $('#user-ig-followers').text(responce.followers);
            $('#user-ig-followings').text(responce.following);
            $('#user-ig-posts').text(responce.posts);
            $('#user-ig-dp').attr('src', responce.dp);
        },
        error: function (error) {
            // toastr.warning('Something goes wrong', 'Request failed');
        }
    });
}

function renderProfile() {
    if (isInstagramConnected()) {
        $('#user-info').removeClass('sec-remove');
        setInstagramUserInfo()

        let userInstagramInfo = setInterval(function () {
            setInstagramUserInfo()
        }, 30000);

    } else {
        $('#connect-instagram').removeClass('sec-remove');
    }
}

