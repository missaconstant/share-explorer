<?php

    namespace framer;

    class Config {

        public static $db_user = "root";

        public static $db_password = "root";

        public static $db_name = "sendem";

        public static $db_host = "localhost:8889";

        public static $db_type = "mysql";

        public static $serve_port = 6100;

        public static $dev_host = "localhost";

        public static $share_host = "0.0.0.0";

        public static $fields_files_path = "appfiles/fields_files/";

        public static $fields_files_webpath = 'appfiles/fields_files/';

        public static $jsonp_files_path = 'appfiles/category_params_files/';

        public static $appfolder = "noset";

        public static function set()
        {
            self::$fields_files_path = Statics::$ROOT . self::$fields_files_path;
            self::$fields_files_webpath = Statics::$WROOT . self::$fields_files_webpath;
            self::$jsonp_files_path = Statics::$ROOT . self::$jsonp_files_path;
        }
    }

    Config::set();
