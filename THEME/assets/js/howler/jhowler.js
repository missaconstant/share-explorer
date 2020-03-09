var jhowler = {

    instance: null,

    init: function (sounds) {
        var self = this;

        if ( this.instance ) this.instance.unload();

        this.instance = new Howl({
            src: sounds,
            autoplay: true
        })
        .on('load', function () {
            self.instance.play();
        });
    },

    playSounds: function (sounds) {
        this.init(sounds);
        // this.instance.play();
    }

};
