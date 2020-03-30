// show current dir on load
window.addEventListener('load', function () {
    document.querySelector('.main-content').style.visibility = 'visible';
});


// known extensions
var fileexts = [
    'png', 'jpg', 'gif', 'mp4', 'mp3', 'psd', 'xls',
    'ai', 'eps', 'json', 'js', 'php', 'html', 'css',
    'docx', 'pdf', 'zip', 'xml', 'svg', 'pptx', 'exe',
    'txt', 'avi'
];


// app
var app = new Vue({

    el: '#app',

    data: {
        stack   : { prev: [], next: [] },
        settings: {
            searchbar   : { shown: false, value: '' },
            tinysidebar : { shown: false },
            dropzone    : { shown: false },
            clipboard   : { todo: null, tomove: [], frompath: '' },
            watching    : { state: false, intval: null }
        },
        jprompt : new JDialog(),
        jalert  : new JDialog()
    },

    created: function () {

    },

    mounted: function () {
        var self = this;

        // load home path && path dirs
        this.loadConifgs(function (configs) {
            // update home dir
            self.path       = configs.homedir;
            self.homedir    = configs.homedir;
            self.api        = configs.ip_port;
        });
    },

    methods: {
        /**
        * @method loadConifgs
        * Load a path content
        */
        loadConifgs: function (handle) {
            var self = this;

            // loader
            seHelp.loader.show("Patientez un instant ...");

            // query
            $.ajax({
                url     : 'share.config.json',
                method  : 'get',
                dataType: 'json'
            })
            .done(function (response) {
                handle( response );
            })
            .fail(function (err) {
                self.jalert.show({ title: 'Erreur', message: 'Une erreur est survenue.' });
            })
            .always(function () {
                seHelp.loader.hide();
            });
        },

        /**
        * @method toggleTinySidebar
        * ---
        */
        toggleTinySidebar: function () {
            this.settings.tinysidebar.shown = !this.settings.tinysidebar.shown;
        }
    }

});
