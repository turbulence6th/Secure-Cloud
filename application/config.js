var publicKey;
var privateKey;
var url;

function setKeys(keyname) {
	console.log("Setting Keys: " + keyname);
	chrome.storage.local.get(null,function(items) {
		var exportedPublicKey = JSON.parse(items[keyname]["SECURE_CLOUD_PUBLIC_KEY"]);
		var exportedPrivateKey = JSON.parse(items[keyname]["SECURE_CLOUD_PRIVATE_KEY"]);
		import_public_key(exportedPublicKey).
		then(function(key) {
			console.log("Public key: " + key);
			publicKey = key;
		});
		import_private_key(exportedPrivateKey).
		then(function(key) {
			privateKey = key;
		});
	});
}

// import public key
function import_public_key(exportedPublicKey) {	
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
	    return key;
		
	})
	.catch(function(err){
	    //console.error(err);
	    console.log("bug");
	});
}
//import private key
function import_private_key(exportedPrivateKey) {
	return window.crypto.subtle.importKey(
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
		return key;
	})
	.catch(function(err){
	    //console.error(err);
	});
}
