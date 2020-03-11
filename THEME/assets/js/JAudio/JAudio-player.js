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

    // handle song setting playing
    JAudio.on('playingchanged', function () {
        alert();
    });
}
