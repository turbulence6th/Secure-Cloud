function generate_key() {
	
	var Username = document.getElementById('username').value;
	var Password = document.getElementById('password').value; 
	
	// owncloud login request	
	if (owncloudLoginRequest(Username,Password)) {
		// generate rsa keys
		var keyPair;
		createAndSaveAKeyPair();
		// send key pair to indexed db
		var keyStore = new KeyStore();
		keyStore.open().then(function() {
			keyStore.saveKey(keyPair.publicKey, keyPair.privateKey, 'SECURE_CLOUD_KEY_PAIR');
		});
		/* get keys from indexed db
			var pair = keyStore.getKey("name","SECURE_CLOUD_KEY_PAIR");
			var pub,pri; 
			pair.then(function(object) { pub = object.publicKey});
			pair.then(function(object) { pri = object.privateKey});
		*/
		var publicKey = keyPair.publicKey;
		// send public key to the server
		if (owncloudSendPublicKey(Username,Password,publicKey)) {	
			alert("RSA Key pair has succesfully created and public key has sent to server")
		} else {
			alert("An error occured");
		}
	} else {
		alert("Login Failed");
	}
	
}

function createAndSaveAKeyPair() {

	// Side effect: updates keyPair in enclosing scope with new value.
	return window.crypto.subtle.generateKey(
	    {
		name: "RSA-OAEP",
		modulusLength: 2048,
		publicExponent: new Uint8Array([1, 0, 1]),  //65537 24 bit gösterimi
		hash: {name: "SHA-256"}
	    },
	    true,   
	    ["encrypt", "decrypt"]).
	then(function (key) {
	    keyPair = key;
	    //console.log(key);
	    return key;
	});

}

function owncloudSendPublicKey(username,password,key) {
	var http = new XMLHttpRequest();
	var url = "http://144.122.221.34/owncloud/index.php/apps/endtoend/publickeymanagement";

	var data={};
	data.username = username;
	data.password = password;
	data.key = key;

	var string = JSON.stringify(data);

	http.open('POST',url,true);
	http.setRequestHeader("Content-type", "application/json; charset=utf-8");

	http.onreadystatechange = function() {//Call a function when the state changes.
		if(http.readyState == 4 && http.status == 200) {
			alert(http.responseText);
		}
		if (http.readyState != 4) return false;
		if (http.status != 200 && http.status != 304) {
			alert('HTTP error ' + http.status);
			return false;
		}

		data.resp = JSON.parse(http.responseText);
		if(data.resp.success==false){
			alert('That didn\'t work!');
			return false;
		}else{
			alert('That worked!');
			return true;
		}
	}

	http.send(string);

	return false; //prevent native form submit

}

function owncloudLoginRequest(username,password) {
	var http = new XMLHttpRequest();
	var url = "http://144.122.221.34/register.php";

	var data={};
    	data.username = username;
    	data.password = password;

	var string = JSON.stringify(data);

	http.open('POST',url,true);
    	//http.setRequestHeader("Content-type", "application/json; charset=utf-8");
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
 
	http.onreadystatechange = function() {//Call a function when the state changes.
	    	if(http.readyState == 4 && http.status == 200) {
			alert(http.responseText);
	    	}
	    	if (http.readyState != 4) return false;
		if (http.status != 200 && http.status != 304) {
		    alert('HTTP error ' + http.status);
		    return false;
		}

		data.resp = JSON.parse(http.responseText);
		if(data.resp.success==false){
		    alert('That didn\'t work!');
		    return false;
		    
		}else{
		    alert('That worked!');
			return true;
	    	}
	}

   	 http.send(string);

    return false; //prevent native form submit
}


// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('generate-key').addEventListener('click', generate_key);
  
});
