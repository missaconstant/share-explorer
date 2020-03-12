/**
* @function JAudioPlayer
* manipulate visually JAudio instance to play music
*/
function JAudioPlayer(JAudio) {

    // vars
    var _container  = document.querySelector('.jAudio');
    var _back_btn   = _container.querySelector('.backward');
    var _forw_btn   = _container.querySelector('.forward');
    var _play_btn   = _container.querySelector('.play');
    var _current_t  = _container.querySelector('.current-time');
    var _remain_t   = _container.querySelector('.reamining-time');
    var _playlist   = _container.querySelector('.playlist');
    var _closebtn   = _container.querySelector('.closer');
    var _progress   = _container.querySelector('.bar');

    // helper: __playbtntoggle()
    var __playbtntoggle = function () {
        _play_btn.querySelector('.playbtn').style.display = JAudio.isPaused() || JAudio.isError() ? 'inline' : 'none';
        _play_btn.querySelector('.pausebtn').style.display = JAudio.isPaused() || JAudio.isError() ? 'none' : 'inline';
    };

    // helper: __parsetime
    var __parsetime = function (time) {
        return parseInt(time) < 10 ? '0' + time : time;
    };

    // handle play btn click
    _play_btn.addEventListener('click', function (e) {
        JAudio.togglePlay();

        __playbtntoggle();
    });

    // handle metadata loaded
    JAudio.on('metaloaded', function (song) {
        var time        = JAudio.time();
        var duration    = {
            min: __parsetime(Math.floor(time.duration/60)),
            sec: __parsetime(Math.floor(time.duration%60))
        };

        _current_t.textContent  = '00:00';
        _remain_t.textContent   = duration.min + ':' + duration.sec;
        _progress.style.width   = '0%';
    });

    // handle song setting playing
    JAudio.on('play', function (song) {
        __playbtntoggle();
    });

    // handle error
    JAudio.on('error', function () {
        JAudio.stop();
        __playbtntoggle();
    });

    // handle time changing
    JAudio.on('progress', function () {
        var time = JAudio.time();
        var prct = (time.current / time.duration) * 100;
        var past = {
            min: __parsetime(Math.floor(time.current/60)),
            sec: __parsetime(Math.floor(time.current%60))
        };

        _current_t.textContent  = past.min + ':' + past.sec;
        _progress.style.width   = prct + '%';
    });

    // handle song end
    JAudio.on('end', function (song) {
        JAudio.stop();
        __playbtntoggle();

        _current_t.textContent  = '00:00';
        _progress.style.width   = '0%';
    });
}
