
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

function shareFile(fileId, username) {
	var sessionKey,publicKey;

	$.ajax({	
		url : url + '/index.php/apps/endtoend/preShareFile',
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
				then(postShareFile);

			}
			
			


		},
		async : true
	});	

}

var sessionKey;

function decryptSessionKey(key) {
	console.log("public key decrypting");
	publicKey = key;
	console.log("imported public key");
	console.log(publicKey);
	// Returns a Promise that yields a Uint8Array AES key.
	// encryptedKey is a Uint8Array, privateKey is the privateKey
	// property of a Key key pair.
	return window.crypto.subtle.decrypt({name: "RSA-OAEP"}, privateKeys['localhost'], sessionKey);
}
function encryptSessionKey(exportedKey) {
	console.log("public key encrypting");
	// Returns a Promise that yields an ArrayBuffer containing
	// the encryption of the exportedKey provided as a parameter,
	// using the publicKey found in an enclosing scope.
	return window.crypto.subtle.encrypt({name: "RSA-OAEP"}, publicKeys['localhost'], exportedKey);
}

function postShareFile(key) {
	console.log("file sharing");
	console.log(arrayBufferToBase64(key));
	portObject.postMessage({
		type: "shareFile",
		fileId: fileId,
		sharedWith: username,
		sessionKey: arrayBufferToBase64(key)
	});
}


function unshareFile(fileId,username) {
	$.ajax({	

			url :  url + '/index.php/apps/endtoend/unshareFile',
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
		url : url + '/index.php/apps/endtoend/changeShareFile',
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

