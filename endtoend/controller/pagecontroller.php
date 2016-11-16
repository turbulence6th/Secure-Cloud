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
use OCP\AppFramework\Controller;
use OCP\IUserManager;
use \OCA\EndToEnd\Db\Author;

class PageController extends Controller {


	private $userId;
	
	private $userManager;

	public function __construct($AppName, IRequest $request, IUserManager $userManager, $UserId){
		parent::__construct($AppName, $request, 'POST',
            'Authorization, Content-Type, Accept', 1728000);
		$this->userManager = $userManager;
		$this->userId = $UserId;
	}

	/**
	 * CAUTION: the @Stuff turns off security checks; for this page no admin is
	 *          required and no CSRF check. If you don't know what CSRF is, read
	 *          it up in the docs or you might create a security hole. This is
	 *          basically the only required method to add this exemption, don't
	 *          add it to any other method if you don't exactly know what it does
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
		$params = ['user' => $this->userId];
		$author = new Author();
		$author->setName('Some*thing');
		return new TemplateResponse('endtoend', 'main', $params);  // templates/main.php
	}

	/**
	 * Simply method that posts back the payload of the request
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function login($username, $password) {
		return new DataResponse(['success' => $this->userManager->checkPassword($username, $password)]);
	}
	


}