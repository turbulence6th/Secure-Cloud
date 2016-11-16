function generate_key() {
	
	// generate rsa keys
		var keyPair;
		createAndSaveAKeyPair().then(exportPublicKey);

}

		
function exportPublicKey(key) {
	window.crypto.subtle.exportKey(
		"jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
		key.publicKey //can be a publicKey or privateKey, as long as extractable was true
	)
	.then(function(keydata){
		//returns the exported key data
		console.log(keydata);
		var result = {};
		result.publicKey = keydata;
		result.key = key;
		// export private key
		exportPrivateKey(result);
	})
	.catch(function(err){
		console.error(err);
	});
	
}

function exportPrivateKey(param) {
	console.log(param);
	window.crypto.subtle.exportKey(
		"jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
		param.key.privateKey //can be a publicKey or privateKey, as long as extractable was true
	)
	.then(function(keydata){
		//returns the exported key data
		//console.log(keydata);
		var result = {};
		result.publicKey = JSON.stringify(param.publicKey);
		result.privateKey = JSON.stringify(keydata);
		chrome.storage.sync.set({"SECURE_CLOUD_PUBLIC_KEY" : result.publicKey}, function() {
          // Notify that we saved.
          alert('Public key saved');
        });
		chrome.storage.sync.set({"SECURE_CLOUD_PRIVATE_KEY" : result.privateKey}, function() {
          // Notify that we saved.
          alert('Private key saved');
        });
		result.key = param.key;
		console.log(result.publicKey);
		console.log(result.privateKey);
		// send public key to the server
		owncloudSendPublicKey(result.publicKey);
	})
	.catch(function(err){
		console.error(err);
	});
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

function owncloudSendPublicKey(key) {
	var http = new XMLHttpRequest();
	var url = "http://144.122.130.1/owncloud/index.php/apps/endtoend/setPublicKey";

	var data={};
	data.key = key;

	var string = JSON.stringify(data);

	http.open('POST',url,true);
	http.setRequestHeader("Content-type", "application/json; charset=utf-8");

	http.onreadystatechange = function() {//Call a function when the state changes.
		if(http.readyState == 4 && http.status == 200) {
			alert(http.responseText);
			data.resp = JSON.parse(http.responseText);
			if(data.resp.success==false){
				alert('That didn\'t work!');
			}else{
				alert("RSA Key pair has succesfully created and public key has sent to server")
			}
		}
		if (http.readyState != 4) return false;
		if (http.status != 200 && http.status != 304) {
			alert('HTTP error ' + http.status);
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
