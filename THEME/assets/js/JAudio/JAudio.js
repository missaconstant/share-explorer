/**
* @class JAudio
* @author Atomix
* @license MIT
*/
function JAudio() {
    var self = this;

    /**
    * @property __instance
    * ---
    */
    this.__instance = document.createElement('audio');

    this.__instance.onerror = function () {
        self.__events.error && self.__events.error();
    };

    this.__instance.ontimeupdate = function () {
        self.__events.progress && self.__events.progress();
    };

    this.__instance.onplay = function () {
        self.__events.play && self.__events.play( self.playlist.get(self.playlist.playing) );
    };

    this.__instance.onpause = function () {
        self.__events.pause && self.__events.pause( self.playlist.get(self.playlist.playing) );
    };

    this.__instance.onloadedmetadata = function () {
        self.__events.metaloaded && self.__events.metaloaded( self.playlist.get(self.playlist.playing) );
    };

    this.__instance.onend = function () {
        self.__events.end && self.__events.end( self.playlist.get(self.playlist.playing) );
    };

    /**
    * @property __id
    * ---
    */
    this.__id = 0;

    /**
    * @property __inited
    * Certify that instance is inited
    */
    this.__inited = false;

    /**
    * @property __events
    * Events
    */
    this.__events = {};

    /**
    * @property volume
    * ---
    */
    this.volume = {
        /* volume state */
        value: 0.5,

        /* increase volume */
        up: function (high) {
            this.value += parseFloat((high/100).toFixed(1));
            this.set( this.value );

            // fire volume up event
            self.__events.volumeup && self.__events.volumeup();
        },

        /* decrease volume */
        down: function (down) {
            this.value -= parseFloat((down/100).toFixed(1));
            this.set( this.value );

            // fire volume down event
            self.__events.volumedown && self.__events.volumedown();
        },

        /* mute */
        mute: function (todo) {
            self.__instance.volume = todo ? 0 : this.value;

            // fire mute event
            self.__events.mute && self.__events.mute();
        },

        /* set volume */
        set: function (value) {
            var val = value > 1 ? 1 : (value < 0 ? 0 : value);

            self.__instance.volume = val;
            this.value = self.__instance.volume;
        }
    };

    /**
    * @property playlist
    * ---
    */
    this.playlist = {
        /* list of song */
        list: [],

        /* playing song id */
        playing: 0,

        /* add song to playlist */
        add: function (song) {
            var songid = this.list.length + 1;
            var topush = { id: songid, name: song.name, source: song.source };

            // push to list
            this.list.push(topush);

            // fire song add event
            self.__events.songadd && self.__events.songadd(topush);

            return songid;
        },

        /* remove song from playlist */
        remove: function (songid) {
            var newlist = this.list.filter(function (item) {
                return item.id != songid;
            });

            // update playlist
            this.list = newlist;

            // fire song remove event
            self.__events.songremove && self.__events.songremove(songid);

            return songid;
        },

        /* get song from playlist by id */
        get: function (songid) {
            var song = this.list.filter(function (item) {
                return item.id == songid;
            });

            return song[0] || false;
        },

        /* restore play list */
        restore: function () {
            this.list = [];

            // fire song remove event
            self.__events.playlistrestore && self.__events.playlistrestore();
        },

        setPlaying: function (songid) {
            var song = this.get( songid );

            if ( !song ) return;

            self.__instance.src = song.source;
            this.playing = songid;

            self.__events.playingchanged && self.__events.playingchanged(song);
        }
    };

    // initializing
    this.init();
}

/**
* @property __count
* Counts JAudio instances
*/
JAudio.__count = 0;

/**
* @method init
* initialize JAudio instance
*/
JAudio.prototype.init = function () {
    if ( this.__inited ) return;

    // set the instance ID by counting up
    JAudio.__count++;
    this.__id = JAudio.__count;

    // put audio element on dom
    this.__instance.id              = 'JA_' + this.__id;
    this.__instance.className       = 'JAudio-audio';
    this.__instance.style.display   = 'none';
    document.body.appendChild( this.__instance );
};

/**
* @method getAUdioElement
* get JAudio instance
*/
JAudio.prototype.getAudioElement = function () {
    return this.__instance;
};

/**
* @method on
* play a song
*/
JAudio.prototype.on = function (evt, handler) {
    this.__events[ evt ] = handler;
    return this;
};

/**
* @method play
* play a song
*/
JAudio.prototype.play = function (song, resetplaylist) {
    var self = this;

    if ( song && typeof song == 'object' ) {
        if ( resetplaylist ) this.playlist.restore();

        this.playlist.setPlaying( this.playlist.add(song) );
    }
    else if ( song && typeof song == 'number' ) {
        this.playlist.setPlaying( song );
    }
    else {
        this.__events.resume && this.__events.resume();
    }

    song && this.stop(false);
    this.__instance.play();

    return this;
};

/**
* @method pause
* pause a song
*/
JAudio.prototype.pause = function () {
    this.__instance.pause();

    // fire pause event
    this.__events.pause && this.__events.pause();

    return this;
};

/**
* @method stop
* stop a song
*/
JAudio.prototype.stop = function (pause) {
    this.__instance.currentTime = 0;
    !pause && this.pause();

    // fire stop event
    this.__events.stop && this.__events.stop();

    return this;
};

/**
* @method togglePlay
* toggle a song playing
*/
JAudio.prototype.togglePlay = function () {
    if ( this.isPaused() ) {
        this.play();
    }
    else {
        this.pause();
    }

    return this;
};

/**
* @method isPaused
* check weither the player is paused
*/
JAudio.prototype.isPaused = function () {
    return this.__instance.paused;
};

/**
* @method isError
* check weither the player got error
*/
JAudio.prototype.isError = function () {
    return this.__instance.error;
};

/**
* @method loop
* loop a song
*/
JAudio.prototype.loop = function (loop) {
    this.__instance.loop = loop || false;
    return this;
};

/**
* @method next
* play next song in playlist
*/
JAudio.prototype.prev = function (manual) {
    var now = this.playlist.playing - 1;
    var prev = this.playlist.list[ now - 1 ] || null;

    if ( prev ) {
        this.play( prev.id );
    }
    else {
        manual ? this.play( this.playlist.list[ this.playlist.list.length-1 ].id ) : '';
    }

    return this;
};

/**
* @method next
* play next song in playlist
*/
JAudio.prototype.next = function (manual) {
    var now = this.playlist.playing - 1;
    var nxt = this.playlist.list[ now + 1 ] || null;

    if ( nxt ) {
        this.play( nxt.id );
    }
    else {
        manual ? this.play( this.playlist.list[0].id ) : '';
    }

    return this;
};

/**
* @method time
* manage playing time
*/
JAudio.prototype.time = function () {
    var _i = this.__instance;

    return {
        current     : _i.currentTime,
        duration    : _i.duration,
        remaining   : _i.duration - _i.currentTime
    };
};
