<?php

    namespace framer;

    class Statics
    {
        
        public static $ROOT;
        public static $WROOT;
        public static $INCLUDES;
        public static $THEME;

        public static function set()
        {
            self::$ROOT     = str_replace('index.php', '', $_SERVER['SCRIPT_FILENAME']);
            self::$WROOT    = str_replace('index.php', '', $_SERVER['SCRIPT_NAME']);
            self::$INCLUDES = self::$ROOT . '/vues/includes/';
            self::$THEME    = self::$WROOT . 'THEME/';
        }

    }
    
    Statics::set();