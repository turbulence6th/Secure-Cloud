<?php
$username= $_POST["username"];
$password = $_POST["password"];
function register_user($username,$password){
		
	$admin = "admin";
	$admin_pass = "admin";
	$url='http://' . $admin . ':' . $admin_pass . '@localhost/owncloud/ocs/v1.php/cloud/users';
	$array = array('userid' => $username, 'password' => $password );
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $array);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$response = curl_exec($ch);
	curl_close($ch);
	echo "Response from curl :" . $response;
	

	// Add to a group called 'Users'
	/*
	$groupUrl = $url . '/' . $userName . '/' . 'groups';
	echo "Created groups URL is " . $groupUrl . "<br/>";

	$ownCloudPOSTArrayGroup = array('groupid' => 'Users');

	$ch = curl_init($groupUrl);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $ownCloudPOSTArrayGroup);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$response = curl_exec($ch);
	curl_close($ch);
	echo "Response from curl :" . $response;
	echo "<br/>Added the new user to default group in owncloud";
	*/



}

register_user($username,$password);
?>
