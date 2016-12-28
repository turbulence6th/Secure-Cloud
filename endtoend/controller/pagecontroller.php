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
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Share\IManager;
use OCP\IGroupManager;

use OCA\EndToEnd\Db\PublicKeyDao;
use OCA\EndToEnd\Db\EncryptedShareDao;
use OCA\EndToEnd\Storage\FileStorage;

class PageController extends Controller {

	public function __construct($AppName, IRequest $request, IUserManager $userManager, IDBConnection $db, 
		IUserSession $session, IRootFolder $rootFolder, IManager $manager, IGroupManager $groupManager){
			parent::__construct($AppName, $request, 'POST',
            	'Authorization, Content-Type, Accept', 1728000);
		$this->request = $request;
		$this->userManager = $userManager;
		$this->publicKeyDao = new PublicKeyDao($db);
		$this->encryptedShareDao = new EncryptedShareDao($db);
		$this->session = $session;
		$this->rootFolder = $rootFolder;
		$this->manager = $manager;
		$this->groupManager = $groupManager;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		$user = $this->session->getLoginName();
		$params = ['keys' => ""];
		return new TemplateResponse('endtoend', 'main', $params);
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setPublicKey($key) {
		$user = $this->session->getLoginName();
		
		if(!$key) {
			new DataResponse(['success' => false]);
		}
		
		if($this->publicKeyDao->find($user))	{
			new DataResponse(['success' => false]);
		}
		
		else {
			$this->publicKeyDao->add($user, $key);
		}
		
		return new DataResponse(['success' => true]);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function fileUpload($encryptedKey) {
		$user = $this->session->getLoginName();
		$file = $this->request->getUploadedFile("file");
		
		if(!$file || !$encryptedKey) {
			return new DataResponse(['success' => false]);
		}
		
		$storage = new FileStorage($this->rootFolder->getUserFolder($user));
		$savedFile = $storage->writeFile($file['name'], file_get_contents($file['tmp_name']));
		
		if($this->encryptedShareDao->find_by_user($savedFile->getId(), $user)){
			$this->encryptedShareDao->update($savedFile->getId(), $user, $encryptedKey);
		}
		
		else {
			$this->encryptedShareDao->add_with_change_share($savedFile->getId(), $user, $encryptedKey, 1);
		}
		
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
	public function getFileTreeInterface() {
		$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$tree = array();
		$tree = $this->getFilesInterface($tree, $userFolder);
			
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
		$encryptedShare = $this->encryptedShareDao->find_by_user($file->getId(), $user);
		return new DataResponse(['fileName' => $file->getName(), 'file' => base64_encode($file->getContent()),
			'sessionKey' => $encryptedShare['session_key']]);
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
		$this->encryptedShareDao->delete($fileId);
		return new DataResponse(['success' => true]);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function preShareFile($fileId, $sharedWith) {
		$user = $this->session->getLoginName();
		$publicKey = $this->publicKeyDao->find($sharedWith);
		$encryptedShare = $this->encryptedShareDao->find_by_user($fileId, $user);
		return new DataResponse(['publicKey' => $publicKey['public_key'], 'sessionKey' => $encryptedShare['session_key'],
			'success' => true]);
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function shareFile($fileId, $sharedWith, $sessionKey, $read, $update, $create, $delete, $share, $changeShare) {
		$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		$share = $this->manager->newShare();
		$share->setNode($file);
		$share->setShareType(\OCP\Share::SHARE_TYPE_USER);
		$share->setSharedBy($user);
		$permission = 0;
		$changeShared = 0;
		
		if($read == "true") {
			$permission += \OCP\Constants::PERMISSION_READ;
		}
		
		if($update == "true") {
			$permission += \OCP\Constants::PERMISSION_UPDATE;
		}
		
		if($create == "true") {
			$permission += \OCP\Constants::PERMISSION_CREATE;
		}
		
		if($delete == "true") {
			$permission += \OCP\Constants::PERMISSION_DELETE;
		}
		
		if($share == "true") {
			$permission += \OCP\Constants::PERMISSION_SHARE;
		}
		
		if($changeShare == "true") {
			if($file instanceof File) {
				$permission = 19;
			}
			
			if($file instanceof Folder) {
				$permission = 31;
			}
			
			$changeShared = 1;
		}
		
		$share->setPermissions($permission);
		$share->setSharedWith($sharedWith);
		$this->manager->createShare($share);
		$this->encryptedShareDao->add_with_change_share($fileId, $sharedWith, $sessionKey, $changeShared);
		return new DataResponse(['success' => true]);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function unshareFile($fileId, $unsharedWith) {
	 	$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		$share = $this->manager->getSharedWith($unsharedWith, \OCP\Share::SHARE_TYPE_USER, $file)[0];
		$this->manager->deleteShare($share);
		$this->encryptedShareDao->delete_by_user($fileId, $unsharedWith);
		return new DataResponse(['success' => true]);
	 }
	 
	 /**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function changeShareFile($fileId, $sharedWith, $read, $update, $create, $delete, $share) {
	 	$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		$encryptedShareUser = $this->encryptedShareDao->find_by_user($fileId, $user);
		$encryptedShareWith = $this->encryptedShareDao->find_by_user($fileId, $sharedWith);
		if($file->getOwner()->getUID() == $user || ($encryptedShareUser['change_share'] && !$encryptedShareWith['change_share'])) {
			$shareObj = $this->manager->getSharedWith($sharedWith, \OCP\Share::SHARE_TYPE_USER, $file)[0];
			$permission = 0;
			if($read == "true") {
				$permission += \OCP\Constants::PERMISSION_READ;
			}
			
			if($update == "true") {
				$permission += \OCP\Constants::PERMISSION_UPDATE;
			}
			
			if($create == "true") {
				$permission += \OCP\Constants::PERMISSION_CREATE;
			}
			
			if($delete == "true") {
				$permission += \OCP\Constants::PERMISSION_DELETE;
			}
			
			if($share == "true") {
				$permission += \OCP\Constants::PERMISSION_SHARE;
			}
			
			$shareObj->setPermissions($permission);
			$this->manager->updateShare($shareObj);
			return new DataResponse(['success' => true]);
		}
		
		return new DataResponse(['success' => false]);
	 }

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function newDirectory($parentId, $folderName) {
	 	$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		if($parentId == "false") {
			$userFolder->newFolder($folderName);
		}
		
		else {
			$parentFolder = $userFolder->getById($parentId)[0];
			$parentFolder->newFolder($folderName);
		}
		
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

	private function getFilesInterface($tree, $folder) {
		foreach($folder->getDirectoryListing() as $node) {
			if($node->getMimetype() == "httpd/unix-directory") {
				$nodes = array();
				$nodes = $this->getFilesInterface($nodes, $node);
				array_push($tree, array(name => $node->getName() ,children => $nodes, image => "apps/endtoend/img/img.png"));
			}
			
			else {
				$object = array(name => $node->getName(), fileId => $node->getId(), tags => [$this->getSize($node->getSize())]);
				if($this->startsWith($node->getMimetype(), 'image')) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), 'text')) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/javascript")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/json")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/xml")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/x-shockwave")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "video/x-flv")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/zip")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/x-rar-compressed")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/x-msdownload")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "audio")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), 'video')) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/pdf")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/msword")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/rtf")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/vnd.ms-excel")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				if($this->startsWith($node->getMimetype(), "application/vnd.ms-powerpoint")) {
					$object[image] = "apps/endtoend/img/img.png";
				}
				else {
					$object[image] = "apps/endtoend/img/img.png";
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
