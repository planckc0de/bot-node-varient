$(document).ready(function () {
    
    toastr.options.positionClass = 'toast-bottom-right';

    $('#logout-btn').on('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toastr.info('Logout process start');
        ipcRenderer.send('logout-signel', true);
    });

});