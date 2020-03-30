<?php

	namespace framer;

	include_once __DIR__ . '/../core/streaming.php';

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

		/**
		* @method admin
		* @return view
		*/
		public function admin()
		{
			$this->render('admin');
		}

		public function go()
		{
			phpinfo();
			// echo $_SERVER['REMOTE_ADDR'];
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
			$path 	= str_replace('//', '/', $path);
			$list 	= [];
			$config	= json_decode( file_get_contents(__DIR__ . '/../share.config.json') );

			// is user allowed to see this ?
			if ( strpos( $path, $config->homedir ) === false )
			{
				$this->json_error("Accès non autorisé. Restez chez vous !");
				exit();
			}

			// then open directory
			$dir = opendir( $path );

			// and load all files and directories on
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

			// then close directory
			closedir( $dir );

			if ( $paths )
			{
				return $list;
			}
			else {
				$this->json_success([ "dirs" => $list ]);
				exit();
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
			exit();
		}

		/**
		* @method download
		* @return json
		*/
		public function download()
		{
			// url format: ?l=PATH
			// retrieve path to download
			$c_type		= [
				"pdf" 	=> "application/pdf",
				"jpg" 	=> "image/jpg",
				"jpeg"	=> "image/jpg",
				"png"	=> "image/png",
				"gif"	=> "image/gif",
				"bmp"	=> "image/bmp",
				"mp4"	=> "video/mp4",
				"webm"	=> "video/webm",
				"mp3"	=> "audio/mp3",
				"ogg"	=> "audio/ogg",
				"acc"	=> "audio/acc"
			];
			$filepath 	= [];
			$i			= 1;

			while ( Posts::get([$i]) )
			{
				$filepath[] = Posts::get($i);
				$i++;
			}

			// get the part element from path
			// and merge it to final file path
			$split = preg_match("#\?l=#", Posts::get(0)) ? '?l=' : '?s=';
			$split = preg_match("#\?t=#", Posts::get(0)) ? '?t=' : $split;
			$first = str_replace($split, '', Posts::get(0));
					 array_unshift( $filepath, $first );

			// then mount file path
			$filepath = implode( '/', $filepath );

			// get extension
			$exts = explode('.', $filepath);
			$exts = count($exts) > 1 && strlen(trim($exts[0])) ? strtolower($exts[ count($exts)-1 ]) : '';

			// get the content type
			$content_type = $c_type[ $exts ] ?? null;

			// download
			if ( file_exists($filepath) )
			{
				if ( preg_match("#\?l=#", Posts::get(0)) )
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
				else if ( preg_match("#\?s=#", Posts::get(0)) )
				{
					$stream = new \VideoStream($filepath, $content_type);
					$stream->start();
				}
				else if ( preg_match("#\?t=#", Posts::get(0)) )
				{

					header("Content-Type: $content_type");
					readfile($filepath);
					exit();
				}
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
			exit();
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
			exit();
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
			exit();
		}

		/**
		* @method moveorcopy
		* @return json
		*/
		public function moveorcopy()
		{
			$path = Posts::post('path');
			$from = Posts::post('from');
			$dest = Posts::post('dest');
			$todo = Posts::post('todo');
			$list = Posts::post('list');

			foreach ( $list as $k => $item )
			{
				$source = str_replace('//', '/', $from. '/' .$item);
				$desty	= str_replace('//', '/', $dest. '/' . $item);
				$todo == 'copy' ? $this->rcopy( $source, $desty ) : ( $todo == 'cut' ? $this->rrename( $source, $desty ) : '' );
			}

			return $this->json_success("done", [
				"path" 		=> $path,
				"moveorcopy"=> true,
				"dirs"		=> $this->getPathFiles( $path )
			]);
			exit();
		}

		/**
		* @method watch
		* @return json
		*/
		public function watch()
		{
			$path = str_replace('?w=', '', Posts::get(0));
			$path = strlen( trim($path) ) ? $path.'/' : './';
			echo $path; exit();
		}

		/**
		* @method delTree
		* @author https://www.php.net/manual/fr/function.rmdir.php#110489
		* @return json
		*/
		public function delTree($dir)
		{
			if ( is_dir($dir) )
			{
				$files = array_diff(scandir($dir), array('.','..'));

				foreach ($files as $file) {
					(is_dir("$dir/$file")) ? delTree("$dir/$file") : @unlink("$dir/$file");
				}

				return @rmdir($dir);
			}
			else {
				return @unlink( $dir );
			}
		}

		/**
		* @method rcopy
		* @author https://www.php.net/manual/fr/function.copy.php#104020
		* @return json
		*/
		function rcopy($src, $dst) {
			// if source is the same as destination, then duplicate with new name
			if ( $src == $dst )
			{
				$i = 1;
				$d = explode('.', $dst);
				$c = count($d);

				if ( $c > 1 && strlen($d[ $c-2 ]) )
					$d[ $c-2 ] = $d[ $c-2 ].'_1';
				else
					$d[ $c-1 ] = $d[ $c-1 ].'_1';

				$dst = implode('.', $d);
			}

			// var_dump( $src, $dst ); exit();

			// then operate
			if (file_exists($dst)) $this->delTree($dst);
			if (is_dir($src)) {
				mkdir($dst);
				$files = scandir($src);
				foreach ($files as $file)
					if ($file != "." && $file != "..") $this->rcopy("$src/$file", "$dst/$file");
			}
			else if (file_exists($src)) copy($src, $dst);
		}

		/**
		* @method rrename
		* @about inspired by rcopy from https://www.php.net/manual/fr/function.copy.php#104020
		* @return json
		*/
		function rrename($src, $dst) {
			// if the source is the same as the destination
			if ( $src == $dst )
			{
				return false;
			}

			// then operate
			if (file_exists($dst)) $this->delTree($dst);
			if (is_dir($src)) {
				mkdir($dst);
				$files = scandir($src);
				foreach ($files as $file)
					if ($file != "." && $file != "..") $this->rrename("$src/$file", "$dst/$file");

				$this->delTree( $src );
			}
			else if (file_exists($src)) rename($src, $dst);
		}
	}
