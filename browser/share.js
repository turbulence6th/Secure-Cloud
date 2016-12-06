var exportedPrivateKey;
var privateKey;

//import private key
function import_private_key(exportedPrivateKey) {
	window.crypto.subtle.importKey(
	    "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
	    exportedPrivateKey,
	    {   //these are the algorithm options
		name: "RSA-OAEP",
		hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
	    },
	    true, //whether the key is extractable (i.e. can be used in exportKey)
	    ["decrypt"] //"encrypt" or "wrapKey" for public key import or
			//"decrypt" or "unwrapKey" for private key imports
	)
	.then(function(key){
	    //returns a publicKey (or privateKey if you are importing a private key)
	    //console.log(publicKey);
		privateKey = key;
	})
	.catch(function(err){
	    //console.error(err);
	});
}


chrome.storage.sync.get("SECURE_CLOUD_PRIVATE_KEY", function(data)
{
    if(chrome.runtime.lastError)
    {
        /* error */

        return;
    }

     exportedPrivateKey = JSON.parse(data.SECURE_CLOUD_PRIVATE_KEY);
     import_private_key(exportedPrivateKey);
	

});

function base64ToArrayBuffer(b64) {
    var byteString = window.atob(b64);
    var byteArray = new Uint8Array(byteString.length);
    for(var i=0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    return byteArray;
}

function arrayBufferToBase64(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for(var i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
}

function shareFile(fileId, username) {
	$.ajax({	
		url : 'https://144.122.129.24/owncloud/index.php/apps/endtoend/preShareFile',
		data :  {
			fileId : fileId,
			sharedWith : username
		},
		//dataType : 'json',
		type : 'POST',
		success : function(data) {
			if (data.success) {
				publicKey = data.publicKey;
				var sessionKey = base64ToArrayBuffer(data.sessionKey);
				decryptSessionKey(sessionKey,privateKey).
				then(encryptSessionKey).
				then(shareFile);

			}
			
			


		},
		async : true
	});

	function decryptSessionKey(encryptedKey, privateKey) {
    	// Returns a Promise that yields a Uint8Array AES key.
    	// encryptedKey is a Uint8Array, privateKey is the privateKey
    	// property of a Key key pair.
    	return window.crypto.subtle.decrypt({name: "RSA-OAEP"}, privateKey, encryptedKey);
    }
    function encryptSessionKey(exportedKey) {
		// Returns a Promise that yields an ArrayBuffer containing
		// the encryption of the exportedKey provided as a parameter,
		// using the publicKey found in an enclosing scope.
		return window.crypto.subtle.encrypt({name: "RSA-OAEP"}, publicKey, exportedKey);
	}

	function shareFile(key) {
		$.ajax({	
		url : 'https://144.122.129.24/owncloud/index.php/apps/endtoend/shareFile',
		data :  {
			fileId : fileId,
			sharedWith : username,
			sessionKey : arrayBufferToBase64(key)
		},
		//dataType : 'json',
		type : 'POST',
		success : function(data) {
			if (data.success) {

			}

		},
		async : true
	});

	}	

}





var fileId = 288;
var username = "user";

document.getElementById("shareFile").addEventListener("click",function() {shareFile(fileId,username); });
