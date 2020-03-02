<?php

namespace framer;

/**
 * Decompose l'url pour en extraire les informations de route: controlleur, action, variables globales éventuelles
 */

class Road
{

    /**
     * Identifie le controlleur et l'action requise puis exécute
     */
	public function doAction($controlleur, $action)
	{
		// removing tirets(-) in action
		$action = $this->parseActionSeparator($action);
		// check for controlleur exists
		if ($this->findControlleur($controlleur)) {
			include_once Statics::$ROOT . 'controlleurs/'.ucfirst($controlleur).'Controlleur.php';

			$ctrl = "\\framer\\" . ucfirst($controlleur).'Controlleur';
			$ctrl = new $ctrl();

			if (method_exists($ctrl, $action)) {
				$ctrl->$action();
			}
			else {
				if (method_exists($ctrl, 'index')) {
					$action = 'index';
					$ctrl->$action();
				}
				else {
					throw new Exception("Action Introuvable !", 1);
				}
				
			}
		}
		else {
			if ($this->findControlleur('defaults')) {
				include_once Statics::$ROOT.'controlleurs/DefaultsControlleur.php';
				$ctrl = new DefaultsControlleur();
				$action = $this->parseActionSeparator($controlleur);
				if (method_exists($ctrl, $action)) {
					$ctrl->$action();
				}
				else {
					throw new \Exception("Controlleur Introuvable", 1);
				}
			}
			else {
				throw new \Exception("Controlleur Introuvable", 1);
			}
		}
	}

    /**
     * Recherche le controlleur
     */
	public function findControlleur($controlleur)
	{
		return file_exists(Statics::$ROOT.'controlleurs/'.ucfirst($controlleur).'Controlleur.php');
	}

    /**
     * Retrouve une action depuis une chaine avec des tirets(-)
     */
	public function parseActionSeparator($action) {
	    $newAction = explode('-', $action);
        for ($i=0; $i<count($newAction); $i++) {
            if ($i>0) {
                $newAction[$i] = ucfirst($newAction[$i]);
            }
        }
        return implode('', $newAction);
    }
}

$road = new Road();