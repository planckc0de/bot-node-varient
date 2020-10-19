$(document).ready(function () {

    $(window).scrollTop(0);

    renderProfile();

    toastr.options.positionClass = 'toast-bottom-right';

    $('#instagram-btn').on('click', function () {
        connectInstagram();
    });

    $('#load-more-posts').on('click', function () {
        console.log('Load more clicked');
        let latest = myjson.readValue('flags', 'lastIgPostRendered');
        renderLatestPosts(parseInt(latest));
        return false;
    });

    $('#logout-btn').on('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toastr.info('Logout process start');

        if (userLogout()) {
            ipcRenderer.send('logout-signal', true);
        } else {
            toastr.warning('Logout failed');
        }
    });

});

function userLogout() {

    var requestData = {
        "apitoken": userApiToken,
        "apikey": userApiKey,
        "request": "logout",
        "requestid": "planckbot",
        "auth_lid": myjson.readValue('user', 'loginId')
    };

    return $.ajax({
        type: 'POST',
        url: 'https://api.planckstudio.in/auth/v1/',
        data: requestData,
        dataType: 'json',
        success: function (responce) {
            console.log(responce);
            if (responce.status == "success") {
                return true;
            }
        },
        error: function (error) {
            return false;
        }
    });
}

function openSection(ele) {
    $(window).scrollTop(50);
    $('.section').removeClass('sec-visible').addClass('sec-hidden');
    $(ele).removeClass('sec-hidden').addClass('sec-visible');
    return false;
}

function saveInstagramPostData(data) {

    let username = data.username;
    let userid = data.userid;
    let media = data.media;
    let state = data.state;

    let myData = {
        username: username,
        userid: userid,
        update: "latest",
        media: media
    }

    myjson.updateValue('instagram', { "user": "default" }, myData);
    myjson.updateValue('info', { "type": "instagram" }, { "likes": state.totalLikes });
    myjson.updateValue('info', { "type": "instagram" }, { "comments": state.totalComments });
    myjson.updateValue('info', { "type": "instagram" }, { "views": state.totalViews });
    myjson.updateValue('info', { "type": "instagram" }, { "avgLikes": state.averageLikes });
    myjson.updateValue('info', { "type": "instagram" }, { "avgComments": state.averageComments });
    myjson.updateValue('info', { "type": "instagram" }, { "avgViews": state.averageViews });
}

function getInstgramPostData(id) {

    var requestData = {
        "user": id
    };

    $.ajax({
        type: 'GET',
        url: 'https://api.planckstudio.in/bot/v1/getmedia.php',
        data: requestData,
        dataType: 'json',
        success: function (responce) {
            console.log(responce);
            saveInstagramPostData(responce);
        },
        error: function (error) {
            return false;
        }
    });
}

function setInstagramUserInfo() {

    getInstagramUserInfo(myjson.readValue('session', 'ds_user_id'));

    let searchValue = myjson.searchValue('info', 'type', 'instagram');

    if (searchValue[0].updated) {
        $('#user-ig-name').text(searchValue[0].name);
        $('#user-ig-username').text(searchValue[0].username);
        $('#user-ig-followers').text(searchValue[0].followers);
        $('#user-ig-followings').text(searchValue[0].followings);
        $('#user-ig-posts').text(searchValue[0].posts);
        $('#user-ig-videos').text(searchValue[0].videos);
        $('#user-ig-dp').attr('src', searchValue[0].dp);
        $('#user-ig-likes').text(searchValue[0].likes);
        $('#user-ig-comments').text(searchValue[0].comments);
        $('#user-ig-views').text(searchValue[0].views);
    }

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://instagram.com/" + myjson.readValue('session', 'username') + "/?__a=1",
        "method": "GET",
        "headers": {},
        "data": "{}"
    }

    $.ajax(settings).done(function (response) {
        let user = response.graphql.user;
        myjson.updateValue('info', { "type": "instagram" }, { "username": user.username });
        myjson.updateValue('info', { "type": "instagram" }, { "name": user.full_name });
        myjson.updateValue('info', { "type": "instagram" }, { "posts": user.edge_owner_to_timeline_media.count });
        myjson.updateValue('info', { "type": "instagram" }, { "videos": user.edge_felix_video_timeline.count });
        myjson.updateValue('info', { "type": "instagram" }, { "followers": user.edge_followed_by.count });
        myjson.updateValue('info', { "type": "instagram" }, { "followings": user.edge_follow.count });
        myjson.updateValue('info', { "type": "instagram" }, { "dp": user.profile_pic_url });
    });

}

function renderLatestPosts(from = 0) {

    let searchValue = myjson.searchValue('instagram', 'user', 'default');
    let medias = searchValue[0].media;
    let myflag = 12;
    let total = myjson.readValue('info', 'posts');

    console.log("from: "+from);
    let len = medias.length;

    if (from > len) {
        myjson.updateValue('flags', { "where": true }, { "lastIgPostRendered": from });
        toastr.info('All content loaded');
        return;
    } else {
        if (from == 0) {
            if (len > myflag) {
                len = myflag;
            }
        } else {

            if (!(from > (len + myflag))) {
                len = from + myflag;
            }
        }

        if ( len > total ) {
            toastr.info('All content loaded');
            return;
        }

        console.log("len: "+len);

        for (var i = from; i < len; i++) {
            let tag1 = $("<div></div>").addClass("col-lg-3 col-md-3");
            let tag2 = $("<div></div>").addClass("card");
            let tag3 = $("<div></div>").addClass("body");
            let tag4 = $("<img>").attr('src', medias[i].thumb).addClass('content-post');

            $('#latest-posts').append(tag1.append(tag2.append(tag3.append(tag4))));
        }

        myjson.updateValue('flags', { "where": true }, { "lastIgPostRendered": len });
    }



}

function renderProfile() {

    if (myjson.readValue('flags', 'isInstagramConnected')) {

        $('#user-info').removeClass('sec-remove');
        setInstagramUserInfo()

        let userInstagramInfo = setInterval(function () {
            setInstagramUserInfo()
        }, 30000);

        if (!myjson.readValue('instagram', 'updated')) {
            getInstgramPostData(myjson.readValue('session', 'ds_user_id'));
            myjson.updateValue('instagram', { "user": "default" }, { "updated": true });
        }

        renderLatestPosts();

    } else {
        $('#connect-instagram').removeClass('sec-remove');
    }
}