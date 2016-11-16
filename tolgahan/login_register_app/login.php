<?php
$username= $_POST["username"];
$password = $_POST["password"];
function login($username,$password){
		
		$ch = curl_init();  // Curl için initialize yaptık.
         
        curl_setopt($ch, CURLOPT_URL,"http://localhost/owncloud/index.php/apps/ownnotes/api/0.1/notes");   //URL tanımladık.
		
		curl_setopt($ch, CURLOPT_USERPWD, $username . ":" . $password); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER , 1 );    //  Sonucu ekrana basmasını kapattık.
        curl_setopt($ch,CURLOPT_HTTPGET,1);    // Get metoduyla gönderdik.
         
        $veri = curl_exec($ch);    //çalıştırdık.
        curl_close($ch);    // curl bağlantısını kapattık.
        $sonuc = simplexml_load_string($veri);     //XML olarak yükledik.
        $json = json_encode($sonuc);                //Array e dönüştürdük.
        $arr = json_decode($json,true);
 
        echo $veri;
		
			
		

		
		


}
login($username,$password);
?>
