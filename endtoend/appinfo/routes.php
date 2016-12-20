<?php
/**
 * ownCloud - endtoend
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Cengaverler <oguz.tanrikulu@metu.edu.tr>
 * @copyright Cengaverler 2016
 */

/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> OCA\EndToEnd\Controller\PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */
return [
    'routes' => [
	   ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
	   ['name' => 'page#setPublicKey', 'url' => '/setPublicKey', 'verb' => 'POST'],
	   ['name' => 'page#fileUpload', 'url' => '/fileUpload', 'verb' => 'POST'],
	   ['name' => 'page#getFileTree', 'url' => '/getFileTree', 'verb' => 'GET'],
	   ['name' => 'page#downloadFile', 'url' => '/downloadFile', 'verb' => 'GET'],
	   ['name' => 'page#deleteFile', 'url' => '/deleteFile', 'verb' => 'POST'],
	   ['name' => 'page#preShareFile', 'url' => '/preShareFile', 'verb' => 'POST'],
	   ['name' => 'page#shareFile', 'url' => '/shareFile', 'verb' => 'POST'],
	   ['name' => 'page#unshareFile', 'url' => '/unshareFile', 'verb' => 'POST'],
	   ['name' => 'page#changeShareFile', 'url' => '/changeShareFile', 'verb' => 'POST'],
	   ['name' => 'page#newDirectory', 'url' => '/newDirectory', 'verb' => 'POST'],
    ]
];