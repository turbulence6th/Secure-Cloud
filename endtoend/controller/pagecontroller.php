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
use OCP\Comments\ICommentsManager;

use OCA\EndToEnd\Db\PublicKeyDao;
use OCA\EndToEnd\Db\EncryptedShareDao;
use OCA\EndToEnd\Db\CryptoGroupDao;
use OCA\EndToEnd\Storage\FileStorage;

class PageController extends Controller {

	public function __construct($AppName, IRequest $request, IUserManager $userManager, IDBConnection $db, 
		IUserSession $session, IRootFolder $rootFolder, IManager $manager, IGroupManager $groupManager,
		ICommentsManager $commentManager){
			parent::__construct($AppName, $request, 'POST',
            	'Authorization, Content-Type, Accept', 1728000);
		$this->request = $request;
		$this->userManager = $userManager;
		$this->publicKeyDao = new PublicKeyDao($db);
		$this->encryptedShareDao = new EncryptedShareDao($db);
		$this->cryptoGroupDao = new CryptoGroupDao($db);
		$this->session = $session;
		$this->rootFolder = $rootFolder;
		$this->manager = $manager;
		$this->groupManager = $groupManager;
		$this->commentManager = $commentManager;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index($folderId) {
		$user = $this->session->getLoginName();
		$params = ['files' => $this->rootFolder->getUserFolder($user), 'json' => $folderId];
		return new TemplateResponse('endtoend', 'main', $params);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function login($username, $password) {
		try {
		    $this->session->login($username, $password);
		} catch (Exception $e) {
		    
		}
		
		return new DataResponse(array('success' => true));
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function nameAutocomplete($fileId, $term) {
	 	$me = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($me);
		$file = $userFolder->getById($fileId)[0];
	 	$users = $this->userManager->search($term);
		$cryptoUsers = $this->publicKeyDao->get_all_usernames();
		$groups = $this->groupManager->search($term);
		$cryptoGroups = $this->cryptoGroupDao->get_all_groups();
		$response = array();
		$userShares = $this->manager->getSharesBy($me, \OCP\Share::SHARE_TYPE_USER, $file);
		$userShared = $this->manager->getSharedWith($me, \OCP\Share::SHARE_TYPE_USER, $file);
		foreach($users as $user) {
			$pass = true;
			$pass_crypto = false;
			foreach($cryptoUsers as $entry) {
				if($entry['user_id'] == $user->getUID()) {
					$pass_crypto = true;
				}
			}
			
			foreach($userShares as $share) {
				if($share->getSharedWith() == $user->getUID()) {
					$pass = false;
				}
			}
			foreach($userShared as $share) {
				if($share->getSharedBy() == $user->getUID()) {
					$pass = false;
				}
			}
			
			if($pass && $pass_crypto && $user->getUID() != $me)
				array_push($response, $user->getUID());
		}
		foreach($groups as $group) {
			$pass = false;
			foreach($cryptoGroups as $entry) {
				if($entry['group_id'] == $group->getGID()) {
					$pass = true;
				}
			}
			
			if($pass){
				array_push($response, $group->getGID() . "(group)");
			}
			
		}
		
		return new DataResponse($response);
	 }
	 
	 /**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function sharedUsersAndGroups($fileId) {
	 	$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		if ($file) {
			$response = array();
		 	$userShares = $this->manager->getSharesBy($user, \OCP\Share::SHARE_TYPE_USER, $file);
			$groupShares = $this->manager->getSharesBy($user, \OCP\Share::SHARE_TYPE_GROUP, $file);
			foreach($userShares as $share) {
				array_push($response, array("name" => $share->getSharedWith(), "type" => "user", 
					"property" => "sharedWith", "permissions" => $share->getPermissions(), 
					"isFolder" => $file instanceof Folder));
			}
			foreach($groupShares as $share) {
				array_push($response, array("name" => $share->getSharedWith(), "type" => "group",
					"property" => "sharedWith", "permissions" => $share->getPermissions(),
					"isFolder" => $file instanceof Folder));;
			}	
			
			$userShared = $this->manager->getSharedWith($user, \OCP\Share::SHARE_TYPE_USER, $file);
			$groupShared = $this->manager->getSharedWith($user, \OCP\Share::SHARE_TYPE_GROUP, $file);
			foreach($userShared as $share) {
				array_push($response, array("name" => $share->getSharedBy(), "type" => "user", 
					"property" => "sharesBy"));
			}
			foreach($groupShared as $share) {
				array_push($response, array("name" => $share->getSharedBy(), "type" => "group",
					"property" => "sharesBy", "sharedWith" => $share->getSharedWith()));;
			}		
			return new DataResponse(array("data" => $response, "success" => true));
		}
		
	 }
	 
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function renameFile($fileId, $filename) {
		$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		$storage = $file->getStorage();
		$success = rename($file->getPath(), dirname($file->getPath()) . '/' . $filename);
		return new DataResponse(['success' => $success,"asdd" => $file->getPath(), "asdd2" =>dirname($file->getPath()) . '/' . $filename]);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getFolder($folderId) {
		$user = $this->session->getLoginName();
		$response = array();
		
		
		if ($folderId) {
			$folder = $this->rootFolder->getUserFolder($user)->getById($folderId)[0];
		}
	
		else {
			$folder = $this->rootFolder->getUserFolder($user);
		}
		
		
		foreach($folder->getDirectoryListing() as $node) {
			$flag = false;
			
			if($node instanceof Folder) {
				$flag = true;
			}
			
			if($node instanceof File && $this->encryptedShareDao->find_by_model($node->getId(), $user, 'user')){
				$flag = true;
			}
			
			foreach($this->groupManager->getUserGroupIds($this->session->getUser()) as $group) {
				if($this->encryptedShareDao->find_by_model($node->getId(), $group, 'group')){
					$flag = true;
				}
			}
			
			if($flag) {
				array_push($response, array('id' => $node->getId(), 'Name' => preg_replace("/ENCRYPTED_/", '', $node->getName()),
					'Size' => $this->getSize($node->getSize()), 'Modified' => $this->timeElapsed($node->getMTime()) . " ago", 
					'Mime' => $node->getMimeType()));
			}
		}
	
		return new DataResponse($response);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setPublicKey($key) {
		$user = $this->session->getLoginName();
		
		if(!$key) {
			return new DataResponse(['success' => false]);
		}
		
		if($this->publicKeyDao->find($user))	{
			return new DataResponse(['success' => false]);
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
	public function fileUpload($file, $filename, $encryptedKey, $iv, $folderId) {
		$user = $this->session->getLoginName();
		
		if ($folderId!="null") {
			$folder = $this->rootFolder->getUserFolder($user)->getById($folderId)[0];
		}
	
		else {
			$folder = $this->rootFolder->getUserFolder($user);
		}
		
		$storage = new FileStorage($folder);
		$savedFile = $storage->writeFile("ENCRYPTED_" . $filename, $file);	
		
		if($this->encryptedShareDao->find_by_model($savedFile->getId(), $user, 'user')){
			$this->encryptedShareDao->update($savedFile->getId(), $user, $encryptedKey, $iv, 'user');
		}
		
		else {
			$this->encryptedShareDao->add_with_change_share($savedFile->getId(), $user, $encryptedKey, $iv, 1, 'user');
		}
		
		return new DataResponse(['success' => true]);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function downloadFile($fileId) {
		$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		$encryptedShare = $this->encryptedShareDao->find_by_model($file->getId(), $user, 'user');
		if($encryptedShare) {
			return new DataResponse(['fileName' => preg_replace("/ENCRYPTED_/", '', $file->getName()), 'file' => $file->getContent(),
				'sessionKey' => $encryptedShare['session_key'], 'iv' => $encryptedShare['iv']]);
		}
		
		foreach($this->groupManager->getUserGroupIds($this->session->getUser()) as $group) {
			$encryptedShare = $this->encryptedShareDao->find_by_model($file->getId(), $group, 'group');
			if ($encryptedShare) {
				$cryptoGroup = $this->cryptoGroupDao->find($group, $user);
				return new DataResponse(['fileName' => preg_replace("/ENCRYPTED_/", '', $file->getName()), 'file' => base64_encode($file->getContent()),
					'sessionKey' => $encryptedShare['session_key'], 'secretKey' => $cryptoGroup['group_secret']]);
			}
		}
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
		$encryptedShare = $this->encryptedShareDao->find_by_model($fileId, $user, 'user');
		return new DataResponse(['publicKey' => $publicKey['public_key'], 'sessionKey' => $encryptedShare['session_key'],
			'iv' => $encryptedShare['iv'], 'success' => true]);
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function shareFile($fileId, $sharedWith, $sessionKey, $iv) {
		$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		$share = $this->manager->newShare();
		$share->setNode($file);
		$share->setShareType(\OCP\Share::SHARE_TYPE_USER);
		$share->setSharedBy($user);
		$share->setTarget("SECURE_CLOUD");

		if($file instanceof File) {
			$permission = 19;
		}
		
		if($file instanceof Folder) {
			$permission = 31;
		}
		
		$changeShared = 1;
	
		$share->setPermissions($permission);
		$share->setSharedWith($sharedWith);
		$this->manager->createShare($share);
		$this->encryptedShareDao->add_with_change_share($fileId, $sharedWith, $sessionKey, $iv, $changeShared, 'user');
		return new DataResponse(['success' => true, "asd" => "SECURE_CLOUD"]);
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
		$this->encryptedShareDao->delete_by_model($fileId, $unsharedWith, 'user');
		return new DataResponse(['success' => true]);
	 }
	 
	 /**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function changeShareFile($fileId, $sharedWith, $type, $permissions) {
	 	$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		$encryptedShareUser = $this->encryptedShareDao->find_by_model($fileId, $user, 'user');
		$encryptedShareWith = $this->encryptedShareDao->find_by_model($fileId, $sharedWith, 'user');
		if($file->getOwner()->getUID() == $user || ($encryptedShareUser['change_share'] && !$encryptedShareWith['change_share'])) {
			if($type=="user")
				$shareObj = $this->manager->getSharedWith($sharedWith, \OCP\Share::SHARE_TYPE_USER, $file)[0];
			else if($type=="group")
				$shareObj = $this->manager->getSharedWith($sharedWith, \OCP\Share::SHARE_TYPE_GROUP, $file)[0];
			$shareObj->setPermissions($permissions);
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
		if(!$parentId) {
			$userFolder->newFolder("ENCRYPTED_" . $folderName);
		}
		
		else {
			$parentFolder = $userFolder->getById($parentId)[0];
			$parentFolder->newFolder("ENCRYPTED_" . $folderName);
		}
		
		return new DataResponse(['success' => true]);
	 }
	 
	 /**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function createCryptoGroup($groupName, $secretKey, $iv) {
	 	$user = $this->session->getLoginName();
		if($this->groupManager->groupExists($groupName)) {
			return new DataResponse(['success' => false]);
		}
		
	 	$group = $this->groupManager->createGroup($groupName);
		$group->addUser($this->session->getUser());
		$this->cryptoGroupDao->add($groupName, $user, $secretKey, $iv);
		return new DataResponse(['success' => true]);
	 }
	 
	 /**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function preAddNewMemberToGroup($groupName, $username) {
	 	$user = $this->session->getLoginName();
		$cryptoGroup = $this->cryptoGroupDao->find($groupName, $user);
		$publicKey = $this->publicKeyDao->find($username);
		if ($cryptoGroup && $publicKey) {
			return new DataResponse(['success' => true, 'secretKey' => $cryptoGroup['group_secret'], 
				'publicKey' => $publicKey['public_key'], 'iv' => $cryptoGroup['iv']]);
		}
		
		else {
			return new DataResponse(['success' => false]);
		}
	 }
	 
	 /**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function addNewMemberToGroup($groupName, $username, $secretKey, $iv) {
	 	$group = $this->groupManager->get($groupName);
		$group->addUser($this->userManager->get($username));
		$this->cryptoGroupDao->add($groupName, $username, $secretKey, $iv);
		return new DataResponse(['success' => true]);
	 }
	 
	  /**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function leaveFromGroup($groupName) {
	 	$user = $this->session->getLoginName();
		$group = $this->groupManager->get($groupName);
		$group->removeUser($this->session->getUser());
		$this->cryptoGroupDao->delete($groupName, $user);
	 }
	 
	 /**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function preShareWithGroup($fileId, $sharedWith) {
	 	$user = $this->session->getLoginName();
		$encryptedShare = $this->encryptedShareDao->find_by_model($fileId, $user, 'user');
		$cryptoGroup = $this->cryptoGroupDao->find($sharedWith, $user);
		return new DataResponse(['success' => true, 'sessionKey' => $encryptedShare['session_key'], 
			'groupSecret' => $cryptoGroup['group_secret'], 'iv' => $cryptoGroup['iv']]);
	 }
	 
	 /**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	 public function shareWithGroup($fileId, $sharedWith, $encryptedSessionKey) {
	 	$user = $this->session->getLoginName();
		$userFolder = $this->rootFolder->getUserFolder($user);
		$file = $userFolder->getById($fileId)[0];
		$share = $this->manager->newShare();
		$share->setNode($file);
		$share->setShareType(\OCP\Share::SHARE_TYPE_GROUP);
		$share->setSharedBy($user);
		
		if($file instanceof File) {
			$permission = 19;
		}
		
		if($file instanceof Folder) {
			$permission = 31;
		}
			
		$changeShared = 1;
		
		$share->setPermissions($permission);
		$share->setSharedWith($sharedWith);
		$this->manager->createShare($share);
		$this->encryptedShareDao->add_with_change_share($fileId, $sharedWith, $encryptedSessionKey, null, $changeShared, 'group');
		return new DataResponse(['success' => true]);
	 }
	 
	 /**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getComments($fileId){
		$response = array();
		$comments = $this->commentManager->getForObject("files", $fileId);
		foreach($comments as $comment) {
			array_push($response, array("message" => $comment->getMessage(), "user" => $comment->getActorId(),
			 "time" => $this->timeElapsed($comment->getCreationDateTime()->getTimestamp()) . " ago"));
		}
		return new DataResponse($response);
	}
	
	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function makeComment($fileId, $message) {
		$user = $this->session->getLoginName();
		$comment = $this->commentManager->create("users", $user, "files", $fileId);
		$comment->setMessage($message);
		$comment->setVerb('comment');
		$this->commentManager->save($comment);
		return new DataResponse(['success' => true]);
	}
	
	private function startsWith($haystack, $needle) {
	     $length = strlen($needle);
	     return (substr($haystack, 0, $length) === $needle);
	}
	
	private function getSize($byte) {
		if($byte < 1024) {
			return round($byte) . " B";
		}
		
		$byte = $byte / 1024;
		if($byte < 1024) {
			return round($byte) . " KB";
		}
		
		$byte = $byte / 1024;
		if($byte < 1024) {
			return round($byte) . " MB";
		}
		
		$byte = $byte / 1024;
		return round($byte) . " GB";
	}
	
	private function timeElapsed ($time){

	    $time = time() - $time; // to get the time since that moment
	    $time = ($time<1)? 1 : $time;
	    $tokens = array (
	        31536000 => 'year',
	        2592000 => 'month',
	        604800 => 'week',
	        86400 => 'day',
	        3600 => 'hour',
	        60 => 'minute',
	        1 => 'second'
	    );
	
	    foreach ($tokens as $unit => $text) {
	        if ($time < $unit) continue;
	        $numberOfUnits = floor($time / $unit);
	        return $numberOfUnits.' '.$text.(($numberOfUnits>1)?'s':'');
	    }
	
	}
	
}
