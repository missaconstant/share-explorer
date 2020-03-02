<?php

	namespace framer;

	/**
	*
	*/
	class DefaultsControlleur extends controlleur
	{
		private $mdl;

		public function __construct()
		{

		}

		/**
		* @method index
		* @return view
		*/
		public function index()
		{
			$this->render('index');
		}

		public function go()
		{
			phpinfo();
		}

		/**
		* @method getHomePath
		* @return json
		*/
		public function getHomePath()
		{
			$configs = json_decode( file_get_contents(__DIR__ . '/../share.config.json') );

			$this->json_success('done', [
				"homedir" => $configs->homedir
			]);
		}

		/**
		* @method getPathFiles
		* @return dirs json
		*/
		public function getPathFiles($paths=null)
		{
			$path 	= $paths ?? Posts::post('path');
			$path	= strlen( trim($path) ) ? $path.'/' : './';
			$list 	= [];
			$dir	= opendir( $path );

			while ( $file = readdir( $dir ) )
			{
				if ( ! in_array($file, [ '.', '..' ]) )
				{
					$list[] = [
						"filename" 	=> $file,
						"dirname"	=> pathinfo( $path . $file, PATHINFO_DIRNAME ) . '/',
						// "webroute"	=> Statics::$WROOT . $path . $file,
						"isfile"	=> !is_dir( $path . $file )
					];
				}
			}

			closedir( $dir );

			if ( $paths )
			{
				return $list;
			}
			else {
				$this->json_success([ "dirs" => $list ]);
			}
		}

		/**
		* @method upload
		* @return json
		*/
		public function upload()
		{
			$file = Posts::file('file');
			$path = Posts::post('path');
			$path = $path == './' ? $path : $path . '/';
			$indx = Posts::post('index');
			$move = true;
			$emsg = "";

			// let's upload
			if ( $file['error'] != 0 ) {
				$move = false;
				$emsg = "Le fichier est endomagé";
			}
			else {
				if ( !move_uploaded_file($file['tmp_name'], $path . $file['name']) ) {
					$move = false;
					$emsg = "Copie non autorisée.";
				}
			}

			$this->json_success("done", [
				"path" 	=> $path,
				"index" => $indx,
				"moved"	=> $move,
				"cause"	=> $emsg,
				"file"	=> [ "filename" => $file['name'], "isfile" => true ]
			]);
		}

		/**
		* @method download
		* @return json
		*/
		public function download()
		{
			// url format: ?l=PATH
			// retrieve path to download
			$filepath 	= [];
			$i			= 1;

			while ( Posts::get([$i]) )
			{
				$filepath[] = Posts::get($i);
				$i++;
			}

			// get the part element from path
			// and merge it to final file path
			$first = str_replace('?l=', '', Posts::get(0));
			array_unshift( $filepath, $first );

			// then mount file path
			$filepath = implode( '/', $filepath );

			// download
			if ( file_exists($filepath) )
			{
			    header('Content-Description: File Transfer');
			    header('Content-Type: application/octet-stream');
			    header('Content-Disposition: attachment; filename="'.basename($filepath).'"');
			    header('Expires: 0');
			    header('Cache-Control: must-revalidate');
			    header('Pragma: public');
			    header('Content-Length: ' . filesize($filepath));
			    readfile($filepath);
			    exit;
			}
		}

		/**
		* @method create
		* @return json
		*/
		public function create()
		{
			$path = Posts::post('path');
			$path = $path == './' ? $path : $path . '/';
			$name = Posts::post('name');
			$type = Posts::post('type');
			$answ = false;

			switch ( $type )
			{
				case 'file':
					$answ = file_put_contents($path . $name, '') !== false;
					break;

				case 'folder':
					$answ = mkdir( $path . $name );
					break;
			}

			return $this->json_success("done", [
				"path" 	=> $path,
				"name" 	=> $name,
				"type"	=> $type,
				"moved"	=> $answ,
				"dirs"	=> $this->getPathFiles( $path )
			]);
		}

		/**
		* @method delete
		* @return json
		*/
		public function delete()
		{
			$path = Posts::post('path');
			$path = $path == './' ? $path : $path . '/';
			$name = Posts::post('name');
			$comp = $path . $name;
			$answ = false;

			// is directory
			if ( file_exists($comp) && is_dir($comp) )
			{
				$answ = $this->delTree( $comp );
			}
			// is file
			else if ( file_exists($comp) && !is_dir($comp) )
			{
				$answ = @unlink( $comp );
			}

			return $this->json_success("done", [
				"path" 		=> $path,
				"name" 		=> $name,
				"removed"	=> $answ,
				"dirs"		=> $this->getPathFiles( $path )
			]);
		}

		/**
		* @method rename
		* @return json
		*/
		public function rename()
		{
			$path 	= Posts::post('path');
			$old	= Posts::post('old');
			$name 	= Posts::post('name');
			$path 	= $path == './' ? $path : $path . '/';
			$n_comp = $path . $name;
			$o_comp = $path . $old;
			$answ 	= false;

			// renaming
			$answ 	= rename( $o_comp, $n_comp );

			return $this->json_success("done", [
				"path" 		=> $path,
				"name" 		=> $name,
				"renamed"	=> $answ,
				"dirs"		=> $this->getPathFiles( $path )
			]);
		}

		/**
		* @method delTree
		* @author https://www.php.net/manual/fr/function.rmdir.php#110489
		* @return json
		*/
		public function delTree($dir)
		{
			$files = array_diff(scandir($dir), array('.','..'));

			foreach ($files as $file) {
			  (is_dir("$dir/$file")) ? delTree("$dir/$file") : @unlink("$dir/$file");
			}

			return @rmdir($dir);
		}
	}
