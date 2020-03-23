// show current dir on load
window.addEventListener('load', function () {
    document.querySelector('.current-dir').style.visibility = 'visible';
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
        path    : './',
        barpath : './',
        homedir : './',
        pos     : 'Partage',
        api     : 'http://192.168.8.106:6100',
        dirs    : [],
        dirs_   : [],
        stack   : { prev: [], next: [] },
        settings: {
            searchbar   : { shown: false, value: '' },
            tinysidebar : { shown: false },
            dropzone    : { shown: false },
            clipboard   : { todo: null, tomove: [], frompath: '' },
            watching    : { state: false, intval: null }
        },
        jprompt : new JDialog(),
        jalert  : new JDialog(),
        JAudio  : new JAudio(),
        JAPlayer: null
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

            // load path dirs
            self.loadPath( self.path );

            // mount stoneUpload
            seHelp.stoneUpload.init({
                dropzone: document.querySelector('.current-dir'),
                droplist: document.querySelector('.dropzone .body .wrapper'),
                server  : self.api + '/upload',
                dataType: 'json',
                auto    : true,
                maxConcurrent: 3,
                ondroped: function () {
                    // open dropzone
                    self.toggleDropzone(true);
                },
                onbeforesend: function(fd, file) {
                    fd.append('path', self.path);
                    fd.append('index', file.index);
                    return fd;
                },
                onfilecomplete: function (e, file, response) {
                    // if upload & copy ok, update visual dir
                    if ( response.moved ) {
                        self.loadPath(false, false, true);
                        return true;
                    }

                    // when copy failed on server
                    seHelp.stoneUpload.updateStates(response.index, {
                        doing: 'failed',
                        message: response.cause
                    });
                    return false;
                }
            });

            // load start watcher
            // self.watchFolder();

            // initialize JAudio player
            self.initJAudioPlayer();
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
        * @method loadPath
        * Load a path content
        */
        loadPath: function (_path, goingback, refreshing, isfile) {
            var self    = this;
            var oldpath = this.path;

            // stop watcher for a while
            this.settings.watching.state = true;

            // if is file, open the file if possible
            if ( isfile ) {
                var nameparts   = _path.split('.');
                var checkon     = ['mp4', 'mp3', 'ogg', 'webm'].indexOf( nameparts[ nameparts.length-1 ].toLowerCase() ) != -1;
                var link        = this.api + '/defaults/download/?'+ (checkon ? 's':'t') +'=' + encodeURIComponent(this.path + '/' + _path);

                switch ( nameparts[ nameparts.length-1 ].toLowerCase() ) {
                    case 'mp4':
                        jVideo.play( link );
                        break;

                    case 'jpg':
                    case 'jpeg':
                    case 'png':
                    case 'gif':
                    case 'bmp':
                        view.show(link);
                        break;

                    case 'pdf':
                        pdfobject.open(link);
                        break;

                    case 'mp3':
                    case 'ogg':
                    case 'aac':
                        this.JAudio.play({ name: _path, source: link });
                        break;
                }
                return;
            }

            // if os for refreshing
            if ( refreshing )  {
                _path = this.path;
            }
            // if not
            else {
                // update showing path
                // from stack
                if ( /\//.test(_path) ) {
                    this.path = _path;
                }
                // form click
                else {
                    this.stack.next = [];
                    this.path       = this.path + (this.path == './' ? '' : '/') + (_path || '');
                }
            }

            // show loadeer
            seHelp.loader.show("Patientez un instant ...");

            // query
            $.ajax({
                url     : self.api + '/get-path-files',
                method  : 'post',
                data    : {
                    path: self.path
                },
                dataType: 'json'
            })
            .done(function (response) {
                // update dirs
                self.dirs   = response.message.dirs;
                self.filterFile();

                // update path
                if (  !refreshing ) {
                    // add page leaving path to stack
                    self.stack[ goingback ? 'next' : 'prev' ].push(oldpath);
                }

                // update top label
                var _path_ = _path.split('/');
                    !_path_[ _path_.length-1 ].trim().length ? _path_.pop() : '';

                _path_.forEach(function (item) {
                    self.pos = item;
                });

                self.pos        = ['.', ''].indexOf(self.pos.trim()) != -1 ? 'Partage' : self.pos;

                // bar path
                self.barpath    = self.path;
            })
            .fail(function (err) {
                // restore leaving path as current
                self.path = oldpath;
            })
            .always(function () {
                // release watching state
                self.settings.watching.state = false;

                // hide loader
                seHelp.loader.hide();
            });
        },

        /**
        * @method create
        * ---
        */
        create: function (what, label) {
            var self = this;

            this.jprompt.show({
                title: 'Nouveau ' + label,
                message: 'Créer un nouveau ' + label + ' dans ce repertoire',
                cancelBtnText: 'ANNULER',
                okBtnText: 'CREER',
                inputs: [{
                    type: 'text',
                    placeholder: 'Nom du ' + label,
                    name: 'name'
                }]
            })
            .onConfirm(function (vals) {
                if ( !vals.name.length ) {
                    self.jalert.show({
                        title: 'Erreur',
                        message: 'Vous devez specifier un nom pour le ' + label + ' que vous desirez créer',
                        okBtnText: 'OK'
                    });

                    return;
                }

                // display loader
                seHelp.loader.show('Patientez un instant');

                // do query
                $.ajax({
                    url     : self.api + '/create',
                    method  : 'post',
                    data    : {
                        path: self.path,
                        name: vals.name,
                        type: what
                    },
                    dataType: 'json'
                })
                .done(function (response) {
                    if ( ! response.moved ) {
                        self.jalert.show({
                            title: "Erreur",
                            message: "impossible de créer le " + what + " dans ce repertoire."
                        });

                        return;
                    }

                    // upate dirs list
                    self.dirs = response.dirs;

                    // filter
                    self.filterFile();

                    // hide loader
                    seHelp.loader.hide();
                });
            });
        },

        /**
        * @method delete
        * ---
        */
        deleteFile: function (file) {
            var self = this;
            var type = file.isfile ? 'fichier' : 'dossier';

            this.jprompt.show({
                title: 'Attention',
                message: 'Vous allez supprimer le fichier <b>'+ file.filename +'</b>',
                inputs: [],
                cancelBtnText: 'ANNULER',
                okBtnText: 'SUPPRIMER'
            })
            .onConfirm(function (vals) {
                // display loader
                seHelp.loader.show('Patientez un instant');

                // do query
                $.ajax({
                    url     : self.api + '/delete',
                    method  : 'post',
                    data    : {
                        path: self.path,
                        name: file.filename
                    },
                    dataType: 'json'
                })
                .done(function (response) {
                    if ( ! response.removed ) {
                        self.jalert.show({
                            title: "Erreur",
                            message: "impossible de supprimer ce "+ type +"."
                        });

                        return;
                    }

                    // upate dirs list
                    self.dirs = response.dirs;

                    // hide search bar
                    self.settings.searchbar.shown = false;
                    document.querySelector('#se_searchbar').value = '';

                    // filter
                    self.filterFile();

                    // hide loader
                    seHelp.loader.hide();
                })
                .always(function () {
                    // hide loader
                    seHelp.loader.hide();
                });
            });
        },

        /**
        * @method renameFile
        * ---
        */
        renameFile: function (file) {
            var self = this;
            var type = file.isfile ? 'fichier' : 'dossier';

            this.jprompt.show({
                title: 'Renommer le ' + type,
                message: '',
                cancelBtnText: 'ANNULER',
                okBtnText: 'MODIFIER',
                inputs: [{
                    type: 'text',
                    placeholder: 'Nouveau nom du ' + type,
                    value: file.filename,
                    name: 'name'
                }]
            })
            .onConfirm(function (vals) {
                // do nothing if old name == new name
                if ( file.filename == vals.name ) {
                    return;
                }

                // loader
                seHelp.loader.show('Patientez un instant');

                // do query
                $.ajax({
                    url     : self.api + '/rename',
                    method  : 'post',
                    data    : {
                        path: self.path,
                        old : file.filename,
                        name: vals.name

                    },
                    dataType: 'json'
                })
                .done(function (response) {
                    if ( ! response.renamed ) {
                        self.jalert.show({
                            title: "Erreur",
                            message: "impossible de renommer ce "+ type +"."
                        });

                        return;
                    }

                    // upate dirs list
                    self.dirs = response.dirs;

                    // filter
                    self.filterFile();
                })
                .always(function () {
                    // hide loader
                    seHelp.loader.hide();
                });
            });
        },

        /**
        * @method downloadFile
        * ---
        */
        downloadFile: function (file) {
            // alert( file.webroute );
            var a = document.createElement('a');
                a.href = this.api + '/defaults/download/?l=' + encodeURIComponent(this.path + '/' + file.filename);
                a.setAttribute('download', file.filename);
                document.body.appendChild(a);
                a.click();
                a.parentNode.removeChild(a);
        },

        /**
        * @method getDownableLink
        * ---
        */
        getDownableLink: function (file, type) {
            return this.api + '/defaults/download/?'+ (type || 't') +'=' + encodeURIComponent(this.path + '/' + file.filename);
        },

        /**
        * @method addClipBoard
        * ---
        */
        addClipBoard: function (files, todo) {
            var self = this;
            this.settings.clipboard = { todo: todo, tomove: files, frompath: self.path }
        },

        /**
        * @method addClipBoard
        * ---
        */
        pasteFiles: function (destination) {
            var self = this;

            // the loader
            seHelp.loader.show("Patientez un instant ...");

            // do query
            $.ajax({
                url     : self.api + '/moveorcopy',
                method  : 'post',
                data    : {
                    path: self.path,
                    dest: self.path +'/'+ (destination || ''),
                    from: self.settings.clipboard.frompath,
                    todo: self.settings.clipboard.todo,
                    list: self.settings.clipboard.tomove
                },
                dataType: 'json'
            })
            .done(function (response) {
                if ( ! response.moveorcopy ) {
                    self.jalert.show({
                        title: "Erreur",
                        message: "L'operation a échoué !"
                    });

                    return;
                }

                // reinitialize clipboard
                self.settings.clipboard = {
                    frompath: '',
                    todo    : '',
                    tomove  : []
                };

                // upate dirs list
                self.dirs = response.dirs;

                // filter
                self.filterFile();
            })
            .always(function () {
                // hide loader
                seHelp.loader.hide();
            });
        },

        /**
        * @method watchFolder
        * ---
        */
        watchFolder: function (destroywatcher) {
            var self = this;

            if ( destroywatcher ) {
                clearInterval( this.settings.watching.intval );
                this.settings.watching.state = false;
            }

            this.settings.watching.invtal = setInterval(function () {
                if ( !self.settings.watching.state ) {
                    self.settings.watching.state = true;

                    $.ajax({
                        url: self.api + '/defaults/watch/?w=' + encodeURIComponent(self.path),
                        type: 'get',
                        dataType: 'text'
                    })
                    .done(function (response) {
                        console.log(response);
                    })
                    .fail(function (err) {

                    })
                    .always(function () {
                        self.settings.watching.state = false;
                    });
                }
            }, 3000);
        },

        /**
        * @method moveBack
        * Go to previous folder in stack
        */
        moveBack: function () {
            // can we move
            if ( ! this.stack.prev.length ) return;

            var _prev = this.stack.prev[ this.stack.prev.length - 1 ];

            // pop the prevs stack
            this.stack.prev.pop();

            // load path
            this.loadPath( _prev, true );
        },

        /**
        * @method moveForward
        * Go to next folder in stack
        */
        moveForward: function () {
            // can we move
            if ( ! this.stack.next.length ) return;

            var _next = this.stack.next[ this.stack.next.length - 1 ];

            // pop the nexts stack
            this.stack.next.pop();

            // load path
            this.loadPath( _next );
        },

        /**
        * @method moveTop
        * Go to parent folder
        */
        moveTop: function () {
            // set top memory
            var _top = this.path.split('/');
                _top.pop();

            if ( _top.length ) {
                // add end slash if length is 1
                var endslash    = _top.length == 1 ? '/' : '';
                var finalpath   = _top.join('/') + endslash;

                // if final path correspond to actual path, do nothing
                if ( finalpath == this.path ) return;

                // empty prev stack
                this.stack.next = [];

                // load path
                this.loadPath( _top.join('/') + endslash );
            }
        },

        /**
        * @method goHome
        * Go to home dir
        */
        goHome: function () {
            // reinitialize path
            this.path =  this.homedir;

            // load home path
            this.loadPath( this.path );
        },

        /**
        * @method doRefresh
        * ---
        */
        doRefresh: function () {
            this.loadPath( '', false, true );
        },

        /**
        * @method handleFileContextMenu
        * ---
        */
        handleFileContextMenu: function (e, file) {
            e.preventDefault();

            var el = e.target.nodeName == 'LI' ? e.target : e.target.parentNode;
                el = el.nodeName == 'LI' ? el : el.parentNode;
                el.querySelector('.dropdown-toggle').click();
        },

        /**
        * @method triggerSearchBar
        * ---
        */
        triggerSearchBar: function (e) {
            // when press ENTER key
            if ( e.which == 13 ) {
                this.loadPath( this.barpath );
            }
        },

        /**
        * @method toggleSearchBar
        * ---
        */
        toggleSearchBar: function () {
            this.settings.searchbar.shown = !this.settings.searchbar.shown;

            if ( this.settings.searchbar.shown ) {
                document.querySelector('#se_searchbar').focus();
            }
            else {
                document.querySelector('#se_searchbar').value = "";
                this.filterFile();
            }
        },

        /**
        * @method toggleDropzone
        * ---
        */
        toggleDropzone: function (bool) {
            this.settings.dropzone.shown = bool ? bool : !this.settings.dropzone.shown;

            if ( this.settings.searchbar.shown ) {

            }
            else {

            }
        },

        /**
        * @method toggleTinySidebar
        * ---
        */
        toggleTinySidebar: function () {
            this.settings.tinysidebar.shown = !this.settings.tinysidebar.shown;
        },

        /**
        * @method filterFile
        * ---
        */
        filterFile: function (e) {
            var self    = this;
            var allowed = [];
            var keyword = e ? e.target.value : '';

            // close search field if escape pressed
            if ( e && e.which == 27 ) { this.toggleSearchBar(); return; }

            this.dirs_ = this.dirs.filter(function (item) {
                return (new RegExp(keyword, "i")).test(item.filename);
            });
        },

        /**
        * @method renderFileIcon
        * ---
        */
        renderFileIcon: function (file) {
            var nameparts   = file.filename.split('.');
            var extension   = nameparts[ nameparts.length-1 ];
            var torender    = '';
            var fileexts    = window.fileexts;

            // when folder
            if ( !file.isfile ) {
                torender = 'folder';
            }
            else {
                torender = fileexts.indexOf(extension) != -1 ? extension : 'file';
            }

            return torender + '.png';
        },

        /**
        * @method showFileNamePart
        * ---
        */
        showFileNamePart: function (file) {
            var parts   = file.filename.split('.');
            var exts    = file.isfile && parts.length>1 && parts[0].trim().length ? parts[ parts.length-1 ] : '';
            var name    = parts; name.pop();
                name    = window.fileexts.indexOf( exts ) != -1 && file.isfile ? name.join('.') : file.filename;

            return { ext: exts, name: name };
        },

        /**
        * @method isPreviewable
        * ---
        */
        isPreviewable: function (file) {
            return ['jpg', 'png', 'gif', 'jpeg', 'bmp'].indexOf( this.showFileNamePart(file).ext.toLowerCase() ) != -1;
        },

        /**
        * @method getFileExt
        * ---
        */
        getFileExt: function (file) {
            var parts   = file.filename.split('.');
            var exts    = parts[ parts.length-1 ];
            var name    = parts; name.pop();

            return window.fileexts.indexOf( exts ) != -1 && file.isfile ? name.join('.') : file.filename;
        },

        initJAudioPlayer: function () {
            this.JAPlayer = new JAudioPlayer( this.JAudio );
            new SimpleBar( document.querySelector('.jAudio .playlist .wrapper') );
        },

        toggleAudioPlay: function () {
            this.JAPlayer.toggle();
        }
    }

});
