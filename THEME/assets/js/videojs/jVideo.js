var jVideo = {};

jVideo.options = {
    el      : null,
    video   : null,
    vjs     : null,
    inited  : false,
    overlay : null
};

/**
* @method init
* ---
*/
jVideo.init = function() {
    var self = this;

    // add player
    document.querySelector('.jVideo .player-box').innerHTML = '<video id="jVideo-player" class="video-js"></video>';

    // init defaults
    this.el         = document.querySelector('.jVideo');
    this.overlay    = document.querySelector('.jVideo .overlay');
    this.video      = this.el.querySelector('#jVideo-player');

    // binds
    this.overlay.addEventListener('click', function () {
        self.el.style.display = 'none';
        self.vjs.dispose();

        self.inited = false;
    });

    this.video.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
};

/**
* @method play
* ---
*/
jVideo.play = function (src) {
    if ( !this.inited ) this.init();

    // display overlay
    this.el.style.display = 'block';

    // set width
    var bodyWidth = document.body.offsetWidth;
    this.video.setAttribute('width', bodyWidth >= 1000 ? 960 : (bodyWidth));

    // init the player
    this.vjs = videojs('jVideo-player', {
        autoplay: true,
        controls: true,
        preload : 'auto'
    });

    // get type and url
    var type = src.split('.');
        type = 'video/' + type[ type.length-1 ];

    // play the src
    this.vjs.src({ type: type, src: src });
    this.vjs.ready(function () {

    });
};
