// start
var seHelp = {

    /**
    * @object loader
    */
    loader: {
        /**/
        element: null,

        /**
        * @method show
        */
        show: function (message, timeout) {
            var self    = this;
            var element = document.querySelector('.se-loader-sm');

            element.querySelector('.content .message').textContent = message;
            element.classList.add('shown');

            if ( timeout ) {
                setTimeout(function () {
                    self.hide();
                }, timeout);
            }
        },

        /**
        * @method hide
        */
        hide: function () {
            var element = document.querySelector('.se-loader-sm');
                element.classList.remove('shown');
        }
    },

    /**
    * @object stoneUpload
    */
    stoneUpload: {
        starttime   : {},
        dropzone    : null,
        droplist    : null,
        server      : '',
        auto        : false,

        /**
        * @method genTemplate
        */
        genTemplate: function (file) {
            var self = this;
            var exts = file.name.split('.');
                exts = exts[ exts.length-1 ];
            var icon = window.fileexts.indexOf( exts ) < 0 ? 'file' : exts;

            return  '' +
                    '<div class="uploading-box d-flex" id="uploading-'+ file.index +'">' +
                        '<div class="piclabel">' +
                            '<img src="THEME/assets/images/file-icons/'+ icon +'.png" alt="" />' +
                        '</div>' +
                        '<div class="upload-infos flex-grow-1">' +
                            '<div class="up-head d-flex">' +
                                '<div class="up-name flex-grow-1 text-truncate">'+ self.truncateFilename(file.name, 14) +'</div>' +
                                '<div class="up-filesize align-self-center">'+ self.convertFileSize(file.size) +'</div>' +
                                '<div class="up-closebtn align-self-center">' +
                                    '<i class="icon ion-md-close" onclick="window.seHelp.stoneUpload.abort('+ file.index +')"></i>' +
                                '</div>' +
                            '</div>' +
                            '<div class="up-progressbar">' +
                                '<span class="up-progress"></span>' +
                            '</div>' +
                            '<div class="up-state d-flex">' +
                                '<span class="up-percent d-block">En attente ...</span>' +
                                '<span class="up-speed d-block ml-auto">0Kb/s</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        },

        /**
        * @method init
        */
        init: function (options) {
            var self = this;

            // merging options
            this.dropzone   = options.dropzone;
            this.droplist   = options.droplist;
            this.server     = options.server;
            this.auto       = options.auto;
            this.maxConcurrent = options.maxConcurrent;

            // bind uploading zone
            $(this.dropzone).upload({
                action      : self.server,
                autoUpload  : true,
                maxConcurrent: options.maxConcurrent,
                dataType    : options.dataType || 'html',
                maxSize     : options.maxSize || 2000000000000,
                label       : '<i class="icon ion-md-attach" style="position:absolute; top:50%; left:50%; font-size:23px; color:#fff; transform: translate(-50%,-50%);"></i>',
                beforeSend  : function (formData, file) {
                    if (options.onbeforesend) return options.onbeforesend(formData, file);
                    else return formData;
                }
            })
            // when dropped
            .on('queued', function (e, files) {
                // inflating body
                for ( var x in files ) {
                    var file     = files[x];
                    var template = self.genTemplate(file);

                    self.droplist.innerHTML += template;
                }

                // hide when no upload label
                $('.dropzone .when-no-upload').hide();

                // trigger ondroped event
                options.ondroped && options.ondroped(files);
            })
            // when upload starts
            .on ('filestart', function (e, file) {
                self.starttime[ file.index ] = (new Date()).getTime();
                console.log( 'start', e, file );
            })
            // when progressing
            .on('fileprogress', function (e, file, percent) {
                var state = {
                    percent : percent > 100 ? 100 : percent,
                    speed   : 0,
                    doing   : 'progress'
                };

                self.updateStates(file.index, state);
            })
            // when file upload completed
            .on('filecomplete', function (e, file, y) {
                // execute filecomplete callback
                if ( ! (options.onfilecomplete && options.onfilecomplete(e, file, y)) ) {
                    return;
                }

                self.updateStates(file.index, { doing: 'complete', percent: 100 });
            })
            // when remove|abort an upload
            .on('fileremove', function (e, file) {
                self.updateStates(file.index, { doing: 'aborted' });
                console.log('aborted');
            })
            // when error;
            .on('fileerror', function (e, file, errtype) {
                var doIt = 'failed';

                // adapt state by error type
                switch (errtype) {
                    case 'abort':
                        doIt = { doing: 'aborted', message: 'Annulé' };
                        break;

                    case 'size':
                        doIt = { doing: 'failed', message: 'Fichier trop volumineux' };
                        break;

                    default:
                        doIt = { doing: 'failed', message: 'Echec d\'envoi' };
                        break;
                }

                // update state
                self.updateStates(file.index, doIt);
            });

            // return jquery object binded
            return $(this.dropzone);
        },

        /**
        * @method updateStates
        */
        updateStates: function (index, state) {
            var $item = $('#uploading-' + index);

            switch (state.doing) {
                case 'progress':
                    $item.find('.up-progressbar .up-progress').css({ width: state.percent + '%' });
                    $item.find('.up-state .up-percent').text( state.percent + '% téléchargé' );
                    $item.find('.up-state .up-speed').text( this.convertFileSize(state.speed, 'b') + '/s' );
                    break;

                case 'complete':
                    $item.addClass('completed');
                    $item.find('.up-progressbar .up-progress').css({ width: '100%' });
                    $item.find('.up-state .up-percent').text( 'Terminé' );
                    $item.find('.up-state .up-speed').html('<i class="icon ion-md-done-all text-success d-block" style="font-size:14px; transform:translateY(-3px)"></i>');
                    break;

                case 'failed':
                    $item.addClass('failed');
                    $item.find('.up-state .up-percent').text( state.message );
                    $item.find('.up-state .up-speed').html('<i class="icon ion-md-close-circle text-danger d-block" style="font-size:14px; transform:translateY(-3px)""></i>');
                    break;

                case 'aborted':
                    $item.find('.up-progressbar .up-progress').css({ width: '0%' });
                    $item.find('.up-state .up-percent').text( 'Annulation ...' );
                    $item.find('.up-state .up-speed').html('<i class="icon ion-md-information-circle text-warning" d-block" style="font-size:14px; transform:translateY(-3px)"></i>');

                    setTimeout(function () {
                        $item.css({ 'transform': 'translateX(100%)', opacity: '0' });

                        setTimeout(function () {
                            $item.remove();

                            // if no more item in dropzone, get the when-no-upload label back
                            if ( ! $('.uploading-box').length ) {
                                $('.dropzone .when-no-upload').show();
                            }
                        }, 300);
                    }, 600);

                    // if no more item in dropzone, get the when-no-upload label back
                    if ( ! $('.uploading-box').length ) {
                        $('.dropzone .when-no-upload').show();
                    }
                    break;
            }
        },

        /**
        * @method abort
        */
        abort: function (index) {
            var $item = $('#uploading-' + index);

            // if completed, make element desapear
            if ( $item.hasClass('completed') || $item.hasClass('failed') ) {
                $item.css({ 'transform': 'translateX(100%)', opacity: '0' });

                setTimeout(function () {
                    $item.remove();

                    // if no more item in dropzone, get the when-no-upload label back
                    if ( ! $('.uploading-box').length ) {
                        $('.dropzone .when-no-upload').show();
                    }
                }, 300);
            }
            // if not, abort
            else {
                $(this.dropzone).upload('abort', index);
            }
        },

        /**
        * @method truncateFilename
        */
        truncateFilename: function (name, length) {
            var parts   = name.split('.');
            var exts    = parts[ parts.length-1 ];
            var sides   = length/2;

            // remove extension from name (remembering that name may contains '.')
            parts.pop();
            parts = parts.join('.');

            return name.length >= length ? parts.substring(0, sides) + '...' + parts.substring((parts.length-sides), parts.length) + '.' + exts : name;
        },

        /**
        * @method convertFileSize
        */
        convertFileSize: function (size, _unit) {
            var octet   = { value: size/1, unit: _unit || 'o' };
            var kilo    = { value: size/1000, unit: 'K' + (_unit || 'o') };
            var mega    = { value: size/1000000, unit: 'M' + (_unit || 'o') };
            var giga    = { value: size/1000000000, unit: 'G' + (_unit || 'o') };
            var tera    = { value: size/1000000000000, unit: 'T' + (_unit || 'o') }
            var label   = octet.value.toFixed(2) + octet.unit;

            if ( tera.value >= 1 ) {
                label = tera.value.toFixed(2) + tera.unit;
            }
            else if ( giga.value >= 1 ) {
                label = giga.value.toFixed(2) + giga.unit;
            }
            else if ( mega.value >= 1 ) {
                label = mega.value.toFixed(2) + mega.unit;
            }
            else if ( kilo.value >= 1 ) {
                label = kilo.value.toFixed(2) + kilo.unit;
            }

            return label;
        }
    }

};
