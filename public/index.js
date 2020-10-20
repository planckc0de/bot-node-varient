$(document).ready(function () {

    qig.driver.quit();
    $(window).scrollTop(0);

    (async () => {
        await renderProfile();
    })()


    $('#btn-scraping-hashtag').on('click', async function () {
        let hashtag = $('#input-hashtag').val();
        let total = $('#input-hashtag-total').val();

        if (hashtag == null || hashtag == '') {
            toastr.warning('Enter hashtag');
        } else {
            toastr.info('Removing old data');
            $("div.current-hashtag-posts").remove();
            toastr.info('Fetching new data');
            let medias = await qig.getHashtagPost(hashtag, total);
            myjson.updateValue('scrape', { "type": "hashtag" }, { "data": null });
            myjson.updateValue('flags', { "where": true }, { "totalHashtagPosts": parseInt(medias.length) });
            saveInstagramHashtagPostData(hashtag, medias);
            renderHashtagPosts(total);
        }
    });

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


    $('#load-more-hashtag-posts').on('click', function () {
        let latest = myjson.readValue('flags', 'lastIgHashtagPostRendered');
        let total = myjson.readValue('flags', 'totalHashtagPosts');
        renderHashtagPosts(parseInt(total), parseInt(latest));
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

function selectHashtagPost(e, id) {
    $(e).toggleClass("selected");
}



function loadMoreList(type) {

    if (type == 'followings') {
        let latest = myjson.readValue('flags', 'lastIgFollowingsRendered');
        renderInstagramFollowings(parseInt(latest));
        return false;
    }

    if (type == 'followers') {
        let latest = myjson.readValue('flags', 'lastIgFollowersRendered');
        renderInstagramFollowers(parseInt(latest));
        return false;
    }
}

async function renderProfile() {

    if (myjson.readValue('flags', 'isInstagramConnected')) {

        $('#user-info').removeClass('sec-remove');
        await setInstagramUserInfo()

        let userInstagramInfo = setInterval(async function () {
            await setInstagramUserInfo()
        }, 5000);

        if (!myjson.readValue('instagram', 'updated')) {
            getInstgramPostData(myjson.readValue('session', 'ds_user_id'));
            myjson.updateValue('instagram', { "user": "default" }, { "updated": true });
        }

        if (myjson.readValue('instagram', 'followers') == null) {
            let followers = await qig.getUserFollowers(myjson.readValue('session', 'ds_user_id'), getInstagramCookie());
            myjson.updateValue('instagram', { "user": "default" }, { "followers": followers });
        }

        if (myjson.readValue('instagram', 'followings') == null) {
            let followings = await qig.getUserFollowings(myjson.readValue('session', 'ds_user_id'), getInstagramCookie());
            myjson.updateValue('instagram', { "user": "default" }, { "followings": followings });
        }

        renderLatestPosts();
        renderInstagramFollowings();
        renderInstagramFollowers();

    } else {
        $('#connect-instagram').removeClass('sec-remove');
    }
}