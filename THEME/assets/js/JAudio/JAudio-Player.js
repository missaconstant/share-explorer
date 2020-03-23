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
    var _playlist   = _container.querySelector('.playlist .wrapper .simplebar-content');
    var _closebtn   = _container.querySelector('.closer');
    var _progress   = _container.querySelector('.bar');
    var _thebar     = _container.querySelector('.play-progress');

    // template
    var songtemplate = function (song) {
        return  '' +
                // '<div class="song" id="JA-play-'+ song.id +'">' +
                    '<div class="thumb">' +
                        '<i class="icon ion-ios-play ispaused"></i>' +
                        '<i class="icon ion-md-stats isplaying"></i>' +
                    '</div>' +
                    '<div class="infos">' +
                        '<span class="title">'+ song.name +'</span>' +
                        '<span class="album"> --- </span>' +
                    '</div>';
                // '</div>';
    };

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

    // handle prev btn click
    _back_btn.addEventListener('click', function (e) {
        JAudio.prev(true);
    });

    // handle next btn click
    _forw_btn.addEventListener('click', function (e) {
        JAudio.next(true);
    });

    // handle progress bar click
    _thebar.addEventListener('mouseup', function (e) {
        // get mouse offset position
        var mousePos = {
            x: e.pageX || (e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft),
            y: e.pageY || (e.clientY + document.body.scrollTop + document.documentElement.scrollTop)
        };

        // get _thebar offset position
        // function from openclassrooms js course
        var thebarPos = (function (element) {
            var top = 0, left = 0;
            while (element) {
                left += element.offsetLeft;
                top += element.offsetTop;
                element = element.offsetParent;
            }
            return { x: left, y: top };
        })(this);

        var target = mousePos.x - thebarPos.x;
        var baroff = this.offsetWidth;
        var percnt = Math.floor((target / baroff) * 100);
        var duratn = JAudio.time().duration;

        JAudio.getAudioElement().currentTime = (duratn * percnt) / 100;
    });

    // handle close btn click
    _closebtn.addEventListener('click', function (e) {
        _container.classList.remove('shown');
        JAudio.stop();
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

        if ( _playlist.querySelector('.song.playing') ) {
            _playlist.querySelector('.song.playing').classList.remove('playing');
        }

        _playlist.querySelector('#JA-play-' + song.id).classList.add('playing');
    });

    // handle song pause
    JAudio.on('pause', function (song) {
        if ( song ) {
            _playlist.querySelector('#JA-play-' + song.id).classList.remove('playing');
        }
    });

    // handle song end
    JAudio.on('end', function (song) {
        if ( song ) {
            _playlist.querySelector('#JA-play-' + song.id).classList.remove('playing');
        }
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

    // handle song adding to playlist
    JAudio.on('songadd', function (song) {
        var template    = songtemplate( song );
        var songelt     = document.createElement('div');

        songelt.className    = 'song';
        songelt.id           = 'JA-play-' + song.id;
        songelt.innerHTML    = template;

        _playlist.appendChild(songelt);

        // load meta song data
        jsmediatags.read(song.source, {
            onSuccess: function(datas) {
                songelt.querySelector('.infos .album').textContent = [ datas.tags.artist, datas.tags.title ].join(' - ');

                // parse the file
                // if ( datas.tags.picture ) {
                //     var blob = new Blob([datas.tags.picture.data], {
                //         type: datas.tags.picture.format
                //     });
                //
                //     var fr = new FileReader();
                //         fr.onload = function () {
                //             // document.querySelector('.jAudio .player').style.backgroundImage = 'url('+ fr.result +')';
                //             document.querySelectorAll('.files-folders .item img')[0].src = fr.result;
                //         };
                //         fr.readAsDataURL(blob);
                // }
            },
            onError: function(error) {
                console.log(error);
            }
        });

        // bind click event
        songelt.addEventListener('click', function (e) {
            var thesong = this.id.split('JA-play-')[1];

            if ( this.classList.contains('playing') ) {
                JAudio.pause();
            }
            else {
                if ( JAudio.playlist.playing == thesong ) {
                    JAudio.play();
                }
                else {
                    JAudio.play(song.id);
                }
            }

            __playbtntoggle();
        });

        // open visual player
        _container.classList.add('shown');
    });
}

JAudioPlayer.prototype.toggle = function () {
    var el = document.querySelector('.jAudio');
        el.classList[ el.classList.contains('shown') ? 'remove':'add' ]('shown');
};
