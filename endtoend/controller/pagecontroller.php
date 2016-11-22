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

namespace OCA\EndToEnd\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\DataDownloadResponse;
use OCP\AppFramework\Controller;
use OCP\IUserManager;
use OCP\IDBConnection;
use OCP\IUserSession;
use OCP\IServerContainer;
use OCP\Files\IRootFolder;

use OCA\EndToEnd\Db\PublicKeyDao;
use OCA\EndToEnd\Storage\FileStorage;

class PageController extends Controller {

	public function __construct($AppName, IRequest $request, IUserManager $userManager, IDBConnection $db, 
		IUserSession $session, IRootFolder $rootFolder){
			parent::__construct($AppName, $request, 'POST',
            	'Authorization, Content-Type, Accept', 1728000);
		$this->request = $request;
		$this->userManager = $userManager;
		$this->publicKeyDao = new PublicKeyDao($db);
		$this->session = $session;
		$this->rootFolder = $rootFolder;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		$user = $this->session->getLoginName();
		$params = ['keys' => $this->publicKeyDao->find('user'), 'userFolder' => $this->rootFolder->getUserFolder($user)];
		return new TemplateResponse('endtoend', 'main', $params);
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setPublicKey($key) {
		$user = $this->session->getLoginName();
		if(count($this->publicKeyDao->find($user)) > 0)	{
			return new DataResponse(['success' => false]);
		}
		
		$this->publicKeyDao->add($user, $key);
		return new DataResponse(['success' => true]);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function fileUpload() {
		$user = $this->session->getLoginName();
		$file = $this->request->getUploadedFile("file");
		
		if(!$file) {
			return new DataResponse(['success' => false]);
		}
		
		$storage = new FileStorage($this->rootFolder->getUserFolder($user));
		$storage->writeFile($file['name'], file_get_contents($file['tmp_name']));
			
		return new DataResponse(['success' => true]);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getFileTree() {
		$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$tree = array();
		$tree = $this->getFolderItems($tree, $userFolder);
			
		return new DataResponse($tree);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function downloadFile($fileId) {
		$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		return new DataDownloadResponse($file->getContent(), $file->getName(), $file->getMimetype());
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function deleteFile($fileId) {
		$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		$file->delete();
		return new DataResponse(['success' => true]);
	}
	
	private function getFolderItems($tree, $folder) {
		foreach($folder->getDirectoryListing() as $node) {
			if($node->getMimetype() == "httpd/unix-directory") {
				$nodes = array();
				$nodes = $this->getFolderItems($nodes, $node);
				array_push($tree, array('text' => $node->getName() ,'nodes' => $nodes, 'selectable' => false));
			}
			
			else {
				$object = array('text' => $node->getName(), 'fileId' => $node->getId(), 'tags' => [$this->getSize($node->getSize())]);
				if($this->startsWith($node->getMimetype(), 'image')) {
					$object['icon'] = 'glyphicon glyphicon-picture';
				}
				
				array_push($tree, $object);
			}
			
		}
		
		return $tree;
	}
	
	private function startsWith($haystack, $needle) {
	     $length = strlen($needle);
	     return (substr($haystack, 0, $length) === $needle);
	}
	
	private function getSize($byte) {
		if($byte < 1024) {
			return round($byte) . "b";
		}
		
		$byte = $byte / 1024;
		if($byte < 1024) {
			return round($byte) . "kb";
		}
		
		$byte = $byte / 1024;
		if($byte < 1024) {
			return round($byte) . "mb";
		}
		
		$byte = $byte / 1024;
		return round($byte) . "gb";
	}
	
}
