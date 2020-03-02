<?php

	namespace framer;

	/**
	*  Le modele principal !
	*/
	class modele
	{
		protected static $bd ;

		public function __construct(){
			try{
				$pdo_options[\PDO::ATTR_ERRMODE] = \PDO::ERRMODE_EXCEPTION ;
				modele::$bd = new \PDO(Config::$db_type . ':dbname=' . Config::$db_name . '; host=' . Config::$db_host, Config::$db_user, Config::$db_password, $pdo_options) ;
				modele::$bd->exec("set names utf8");
			}
			catch(\Exception $e){
				modele::$bd = false;
				die('Erreur : '.$e->getMessage()) ;
			}
		}

		protected function findClass()
		{
			$class = get_class($this);
			$class = explode('Modele', $class);
			return $class[0];
		}

		public function getByFields( $tablename, $fields )
	    {
	        try {
	            // creating query string
	            $qstring = [];

	            foreach ( $fields as $field => $value )
	            {
	                $qstring[] = "$field=:$field";
	            }

	            // do query
	            $q = self::$bd->prepare( "SELECT * FROM $tablename WHERE " . implode(' AND ', $qstring) );
	            $q->execute( $fields );

	            return $q->fetchAll(\PDO::FETCH_OBJ);
	        }
	        catch (\Exception $e) {
	            // die ( $e->getMessage() );
	            return false;
	        }
	    }
	}
