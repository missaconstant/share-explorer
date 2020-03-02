<?php

    namespace framer;

    /**
    * 
    */
    class Routes
    {

        static function get($action)
        {
            return BASE_URI . '/' . str_replace('.', '/', $action);
        }

        static function getRoutes()
        {
            return [
                
                "default"   => "/",
                "do/signup" => "/users/signup",
                "do/login"  => "/users/login"

            ];
        }

        static function find($route)
        {
            $routes = self::getRoutes();
            return isset($routes[$route]) ? Config::$appfolder . $routes[$route] : Config::$appfolder . $routes['default'];
        }
    }