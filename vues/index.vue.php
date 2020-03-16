<!DOCTYPE html>
<html>
    <head>
        <title>Share Explorer</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/bower_components/bootstrap/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/fonts/ionicons/docs/css/ionicons.min.css">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/js/formstone/dist/css/upload.css">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/js/simplebar/simplebar.css">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/js/videojs/video-js.min.css">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/js/viewer/viewer.min.css">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/js/JDialog/JDialog.css">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/css/jVideo.css">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/js/JAudio/JAudio-Player.css">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/css/style.css">
    </head>
    <body>
        <div class="main">
            <div
                class="app with-tiny"
                id="app"
                v-bind:class="{ 'with-dzone': settings.dropzone.shown }"
            >

                <!-- tiny-sidebar -->
                <div class="tiny-sidebar" v-bind:class="{ 'shown': settings.tinysidebar.shown }">
                    <a href="#" class="logo" @click="toggleTinySidebar">
                        <img src="https://img.utdstc.com/icons/asus-file-manager-android.png:l" alt="">
                        <!-- <img src="https://lh3.googleusercontent.com/proxy/XAa06gxGyDWaY_HS5c77CiicRg4s-5W0Hub2i5HAcQeSO3SoEsqMd0cxcK8gUcWMEr1i0Dv_MtV-TjyvXVW3NTBE11snsfco8LZwbTEHXK0rXVBoG4ExUPDO0v8heeSJTfRPkIxNqsn_dE_W" alt=""> -->
                    </a>
                    <!--  -->
                    <ul class="links d-flex flex-column">
                        <!-- go home -->
                        <li class="active" @click="goHome">
                            <a href="#!"><i class="icon ion-md-home"></i></a>
                        </li>
                        <li class="se-dropdowns dropright">
                            <a href="#!" class=" dropdown-toggle" data-toggle="dropdown" id="dropnewthings" aria-haspopup="false" data-offset="0,10">
                                <i class="icon ion-md-add-circle-outline"></i>
                            </a>
                            <!--  -->
                            <div class="dropdown-menu" aria-labelledby="dropnewthings">
                                <a class="dropdown-item" href="#" @click="create('file', 'fichier')"><i class="icon ion-md-document"></i> Nouveau Fichier</a>
                                <a class="dropdown-item" href="#" @click="create('folder', 'dossier')"><i class="icon ion-md-folder"></i> Nouveau Dossier</a>
                            </div>
                        </li>
                        <!-- paste file in current dir -->
                        <li>
                            <a href="#!" @click="pasteFiles(false)" v-if="settings.clipboard.tomove.length" class="bg-danger"><i class="icon ion-md-clipboard text-white"></i></a>
                        </li>
                        <!-- audio player -->
                        <li @click="toggleAudioPlay()">
                            <a href="#!"><i class="icon ion-md-musical-notes"></i></a>
                        </li>
                        <li>
                            <a href="#!"><i class="icon ion-md-settings"></i></a>
                        </li>
                        <li class="tobottom">
                            <a href="#!"><i class="icon ion-md-power"></i></a>
                        </li>
                    </ul>
                </div>

                <!--  -->

                <!-- main -->
                <div class="main-content clearfix">

                    <!-- top bar -->
                    <div class="topbar">
                        <div class="p-0">
                            <div class="bar-wrap d-flex flex-wrap">
                                <!-- left -->
                                <div class="icons icons-left align-self-center">
                                    <ul class="actions d-flex">
                                        <li class="tiny-toggler d-block d-sm-none" @click="toggleTinySidebar"><i class="icon ion-md-menu"></i></li>
                                        <li><i class="icon ion-ios-arrow-back" @click="moveBack"></i></li>
                                        <li><i class="icon ion-ios-arrow-forward" @click="moveForward"></i></li>
                                        <li><i class="icon ion-md-arrow-up" @click="moveTop"></i></li>
                                    </ul>
                                </div>
                                <!-- middle -->
                                <div class="flex-grow-1 location-bar align-self-center text-center">
                                    <input class="bar-text d-none d-sm-block" v-model="barpath" @keyup="triggerSearchBar"></input>
                                    <span class="ico" @click="doRefresh">
                                        <i class="icon ion-md-refresh"></i>
                                    </span>
                                </div>
                                <!-- right -->
                                <div class="icons icons-right align-self-center">
                                    <ul class="actions d-flex">
                                        <li><i class="icon ion-md-search" v-bind:class="{ 'text-danger': settings.searchbar.shown }" @click="toggleSearchBar"></i></li>
                                        <!-- <li><i class="icon ion-md-download"></i></li> -->
                                        <!-- <li><i class="icon ion-md-more"></i></li> -->
                                    </ul>
                                </div>
                            </div>
                            <!--  -->
                            <div class="searchbar" v-bind:class="{ 'shown': settings.searchbar.shown }">
                                <input type="text" @keyup="filterFile" placeholder="Que cherchez vous ?" id="se_searchbar">
                            </div>
                        </div>
                    </div>

                    <!-- current dir -->
                    <div class="current-dir" style="visibility: hidden;" v-bind:class="{ 'show-fst-trigger': settings.dropzone.shown }">
                        <h2 class="title mt-5">{{ pos }}</h2>
                        <!--  -->
                        <div class="files-folders mt-5">
                            <ul class="items d-flex flex-wrap">
                                <li
                                    class="item se-dropdowns dropdown"
                                    v-for="item in dirs_"
                                    v-bind:key="item.filename"
                                    v-on:dblclick="loadPath(item.filename, false, false, item.isfile)"
                                    v-on:contextmenu="handleFileContextMenu"
                                >
                                    <a href="#!" class="filecontextmenu dropdown-toggle" id="dropfilecontext" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="icon ion-md-more"></i>
                                    </a>
                                    <!-- <i class="icon" v-bind:class="item.isfile ? 'ion-md-document' : 'ion-md-folder'"></i> -->
                                    <img v-bind:src="'<?= framer\Statics::$THEME ?>assets/images/file-icons/' + renderFileIcon(item)" alt="" class="ico-png" v-if="!isPreviewable(item)">
                                    <div class="preview"  v-if="isPreviewable(item)">
                                        <img v-bind:src="getDownableLink(item, 't')" alt="">
                                    </div>
                                    <span class="item-name">{{ showFileNamePart(item).name }}</span>

                                    <!--  -->

                                    <div class="dropdown-menu" aria-labelledby="dropfilecontext">
                                        <a class="dropdown-item" href="#" @click="addClipBoard([item.filename], 'copy')"><i class="icon ion-md-copy"></i> Copier</a>
                                        <a class="dropdown-item" href="#" @click="addClipBoard([item.filename], 'cut')"><i class="icon ion-md-cut"></i> Couper</a>
                                        <a class="dropdown-item" href="#" @click="pasteFiles(item.filename)" v-if="settings.clipboard.tomove.length && !item.isfile"><i class="icon ion-md-clipboard"></i> Coller</a>
                                        <a class="dropdown-item" href="#" @click="renameFile(item)"><i class="icon ion-md-create"></i> Renommer</a>
                                        <a class="dropdown-item" href="#" @click="deleteFile(item)"><i class="icon ion-md-trash"></i> Supprimer</a>
                                        <div class="dropdown-divider" v-if="item.isfile"></div>
                                        <a class="dropdown-item" href="#" @click="downloadFile(item)" v-if="item.isfile"><i class="icon ion-md-download"></i> Télécharger</a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- dropzone -->
                <div
                    class="dropzone d-flex flex-column"
                    v-bind:class="{ 'shown': settings.dropzone.shown }"
                >
                    <div class="head d-flex align-items-center">
                        <h4 class="flex-grow-1"><i class="icon ion-md-cloud-upload"></i>Téléchargements</h4>
                        <i class="icon ion-md-close" @click="toggleDropzone()"></i>
                    </div>
                    <div class="body d-flex flex-grow-1 flex-column">
                        <div class="wrapper">
                            <!-- file upload template -->
                            <!-- <div class="uploading-box d-flex">
                                <div class="piclabel">
                                    <img src="<?= framer\Statics::$THEME ?>assets/images/file-icons/file.png" alt="" />
                                </div>
                                <div class="upload-infos flex-grow-1">
                                    <div class="up-head d-flex">
                                        <div class="up-name flex-grow-1 text-truncate">My Super file.png</div>
                                        <div class="up-closebtn align-self-center">
                                            <i class="icon ion-md-close"></i>
                                        </div>
                                    </div>
                                    <div class="up-progressbar">
                                        <span class="up-progress"></span>
                                    </div>
                                    <div class="up-state d-flex">
                                        <span class="up-percent d-block">40% téléchargé</span>
                                        <span class="up-speed d-block ml-auto">120Kb/s</span>
                                    </div>
                                </div>
                            </div> -->
                            <!-- / file upload template -->
                            <p class="when-no-upload text-center">
                                <i class="icon ion-md-cloud-outline"></i> <br>
                                Aucun téléchargement
                            </p>
                        </div>
                    </div>
                </div>

                <!-- dropzone toggler -->
                <button class="dzone-toggle" @click="toggleDropzone()">
                    <i class="icon ion-md-archive"></i>
                </button>

            </div>
        </div>

        <!-- loader -->
        <div class="se-loader-sm">
            <div class="overlay"></div>
            <div class="loadbox d-flex align-items-center">
                <div class="ico-load">
                    <div class="spinner-grow text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
                <div class="content">
                    <span class="message">Patientez un instant ...</span>
                </div>
            </div>
        </div>

        <!-- JDialog templae -->
        <!-- <div class="jd-box">
            <div class="jd-overlay"></div>
            <div class="jd-conten-box">
                <div class="jd-content">
                    <h3 class="jd-title">Alert</h3>
                    <p class="jd-message">Hey this is JDialog, your new dialog plugin.<br><b>Enjoy !</b></p>
                    <div class="jd-form">
                    </div>
                    <div class="jd-footer">
                        <button class="jd-cancel-btn">ANNULER</button>
                        <button class="jd-confirm-btn">CONFIRMER</button>
                    </div>
                </div>
            </div>
        </div> -->

        <!-- Video Player -->
        <div class="jVideo">
            <div class="overlay"></div>
            <div class="player-box">
                <!--  -->
            </div>
        </div>

        <!-- Audio Player -->
        <div class="jAudio">
            <div class="player d-flex align-items-center">
                <div class="play-controls">
                    <div class="ctrls-wrapper">
                        <a href="#" class="playctrl backward">
                            <i class="icon ion-ios-arrow-back"></i>
                        </a>
                        <a href="#" class="playctrl main play">
                            <i class="icon ion-ios-play playbtn"></i>
                            <i class="icon ion-ios-pause pausebtn"></i>
                        </a>
                        <a href="#" class="playctrl forward">
                            <i class="icon ion-ios-arrow-forward"></i>
                        </a>
                    </div>
                    <div class="play-progress">
                        <span class="current-time">00:00</span>
                        <span class="reamining-time">00:00</span>
                        <span class="bar"></span>
                    </div>
                </div>
            </div>
            <div class="playlist">
                <div data-simplebar class="wrapper">
                    <!-- <div class="song playing">
                        <div class="thumb">
                            <i class="icon ion-ios-play ispaused"></i>
                            <i class="icon ion-md-stats isplaying"></i>
                        </div>
                        <div class="infos">
                            <span class="title">Name of the song playing.mp3</span>
                            <span class="album">Album name - 2001</span>
                        </div>
                    </div> -->
                </div>
            </div>
            <a href="#" class="closer">
                <i class="icon ion-md-close"></i>
            </a>
        </div>

        <!-- Picture viewer -->
        <div class="pictoview">
            <img src="" alt="" id="picviewer" class="d-none">
        </div>

        <!-- scripts -->
        <script src="<?= framer\Statics::$THEME ?>assets/bower_components/jquery/dist/jquery.min.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/bower_components/bootstrap/dist/js/bootstrap.bundle.min.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/videojs/video.min.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/simplebar/simplebar.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/videojs/jVideo.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/viewer/viewer.min.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/viewer/view.js" charset="utf-8"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.3/jsmediatags.min.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/JAudio/JAudio.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/JAudio/JAudio-Player.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/vue.dev.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/formstone/dist/js/core.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/formstone/dist/js/upload.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/JDialog/JDialog.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/help.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/main.js" charset="utf-8"></script>
    </body>
</html>
