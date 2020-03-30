<!DOCTYPE html>
<html>
    <head>
        <title>Share Explorer</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/bower_components/bootstrap/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="<?= framer\Statics::$THEME ?>assets/fonts/ionicons/docs/css/ionicons.min.css">
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
                        <li class="active">
                            <a href="#!"><i class="icon ion-md-home"></i></a>
                        </li>
                        <li class="se-dropdowns dropright">
                            <a href="#!" class=" dropdown-toggle" data-toggle="dropdown" id="dropnewthings" aria-haspopup="false" data-offset="0,10">
                                <i class="icon ion-md-add-circle-outline"></i>
                            </a>
                            <!--  -->
                            <div class="dropdown-menu" aria-labelledby="dropnewthings">
                                <a class="dropdown-item" href="#"><i class="icon ion-md-document"></i> Nouveau Fichier</a>
                                <a class="dropdown-item" href="#"><i class="icon ion-md-folder"></i> Nouveau Dossier</a>
                            </div>
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
                <div class="main-content no-toppadding allow-scrolling clearfix">
                    <!-- header -->
                    <div class="admin-header">
                        <a href="#" class="tiny-toggle" @click="toggleTinySidebar">
                            <i class="icon ion-md-menu"></i>
                        </a>
                        <!--  -->
                        <h2 class="admin-title">Accueil</h2>
                    </div>

                    <!-- Counts boxes -->
                    <div class="admin-counts px-sm-4">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-sm-3 mb-4">
                                    <div class="count px-4 py-4">
                                        <div class="row align-items-center">
                                            <div class="col-auto mr-auto infos">
                                                <h4>Utilisateurs</h4>
                                                <span>00</span>
                                            </div>
                                            <div class="col-auto ico">
                                                <i class="icon ion-md-person"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-3 mb-4">
                                    <div class="count px-4 py-4">
                                        <div class="row align-items-center">
                                            <div class="col-auto mr-auto infos">
                                                <h4>Actions</h4>
                                                <span>00</span>
                                            </div>
                                            <div class="col-auto ico">
                                                <i class="icon ion-md-cog"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-3 mb-4">
                                    <div class="count px-4 py-4">
                                        <div class="row align-items-center">
                                            <div class="col-auto mr-auto infos">
                                                <h4>Téléchargerments</h4>
                                                <span>00</span>
                                            </div>
                                            <div class="col-auto ico">
                                                <i class="icon ion-md-download"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-3 mb-4">
                                    <div class="count px-4 py-4">
                                        <div class="row align-items-center">
                                            <div class="col-auto mr-auto infos">
                                                <h4>Uploads</h4>
                                                <span>00</span>
                                            </div>
                                            <div class="col-auto ico">
                                                <i class="icon ion-md-cloud-upload"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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

        <!-- routes -->
        <input type="hidden" id="theme_url" value="<?= framer\Statics::$THEME ?>" />

        <!-- scripts -->
        <script src="<?= framer\Statics::$THEME ?>assets/bower_components/jquery/dist/jquery.min.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/bower_components/bootstrap/dist/js/bootstrap.bundle.min.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/vue.dev.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/JDialog/JDialog.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/help.js" charset="utf-8"></script>
        <script src="<?= framer\Statics::$THEME ?>assets/js/admin.js" charset="utf-8"></script>
    </body>
</html>
