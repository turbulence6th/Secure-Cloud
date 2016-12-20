var url = window.location.origin;

var exportedPrivateKey;
var privateKey;


// import public key
function importPublicKey(exportedPublicKey) {	
	return window.crypto.subtle.importKey(
	    "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
	    exportedPublicKey,
	    {   //these are the algorithm options
		name: "RSA-OAEP",
		hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
	    },
	    true, //whether the key is extractable (i.e. can be used in exportKey)
	    ["encrypt"] //"encrypt" or "wrapKey" for public key import or
			//"decrypt" or "unwrapKey" for private key imports
	)
	.then(function(key){
	    //returns a publicKey (or privateKey if you are importing a private key)
	    //console.log(key);
		publicKey = key;
		console.log("imported public key");
		console.log(publicKey);
		return key;
		
	})
	.catch(function(err){
	    //console.error(err);
	    console.log("bug");
	});
}

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

function shareFile(fileId, username,permissions) {
	var sessionKey,publicKey;
	$.ajax({	
		url : url + '/owncloud/index.php/apps/endtoend/preShareFile',
		data :  {
			fileId : fileId,
			sharedWith : username,
			
		},
		//dataType : 'json',
		type : 'POST',
		success : function(data) {
			if (data.success) {
				publicKey = JSON.parse(data.publicKey);
				sessionKey = base64ToArrayBuffer(data.sessionKey);
				console.log(publicKey);
				importPublicKey(publicKey).
				then(decryptSessionKey).
				then(encryptSessionKey).
				then(shareFile);

			}
			
			


		},
		async : true
	});

	function decryptSessionKey(key) {
		console.log("public key decrypting");
		publicKey = key;
		console.log("imported public key");
		console.log(publicKey);
    	// Returns a Promise that yields a Uint8Array AES key.
    	// encryptedKey is a Uint8Array, privateKey is the privateKey
    	// property of a Key key pair.
    	return window.crypto.subtle.decrypt({name: "RSA-OAEP"}, privateKey, sessionKey);
    }
    function encryptSessionKey(exportedKey) {
    	console.log("public key encrypting");
		// Returns a Promise that yields an ArrayBuffer containing
		// the encryption of the exportedKey provided as a parameter,
		// using the publicKey found in an enclosing scope.
		return window.crypto.subtle.encrypt({name: "RSA-OAEP"}, publicKey, exportedKey);
	}

	function shareFile(key) {
		console.log("file sharing");
		console.log(arrayBufferToBase64(key));
		$.ajax({	
			url : url + '/owncloud/index.php/apps/endtoend/shareFile',
			data :  {
				fileId : fileId,
				sharedWith : username,
				sessionKey : arrayBufferToBase64(key),
				read : permissions["read"],
				update : permissions["update"],
				create : permissions["create"],
				delete : permissions["delete"],
				share : permissions["share"],
				changeShare : permissions["changeShare"]
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


function unshareFile(fileId,username) {
	$.ajax({	

			url :  url + '/owncloud/index.php/apps/endtoend/unshareFile',
			data :  {
				fileId : fileId,
				unsharedWith : username
			},
			//dataType : 'json',
			type : 'POST',
			success : function(data) {
				if (data.success) {
					console.log("The file has successfully unshared");
				}

			},
			async : true
		});	
}


function changeShareFile(fileId,username,permissions) {
	$.ajax({	
		url : url + '/owncloud/index.php/apps/endtoend/changeShareFile',
		data :  {
			fileId : fileId,
			sharedWith : username,
			read : permissions["read"],
			update : permissions["update"],
			create : permissions["create"],
			delete : permissions["delete"],
			share : permissions["share"]
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


var fileId = 392;
var username = "user";
var permissions = {

	"read" : true,
	"update" : true,
	"create" : false,
	"delete" : false,
	"share" : true,
	"changeShare" : true
};

document.getElementById("share").addEventListener("click",function() {shareFile(fileId,username,permissions); });
document.getElementById("unshare").addEventListener("click",function() {unshareFile(fileId,username); });
document.getElementById("changeShare").addEventListener("click",function() {changeShareFile(fileId,username,permissions); });
