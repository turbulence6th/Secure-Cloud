var publicKeys = {};
var privateKeys = {};
var url;

// import public key
function import_public_key(keyname, exportedPublicKey) {	
	window.crypto.subtle.importKey(
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
		publicKeys[keyname] = key;
		
	})
	.catch(function(err){
	    //console.error(err);
	    console.log("bug");
	});
}

//import private key
function import_private_key(keyname, exportedPrivateKey) {
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
		privateKeys[keyname] = key;
	})
	.catch(function(err){
	    //console.error(err);
	});
}



chrome.storage.local.get(null, function(items)
{
   	var allKeys = Object.keys(items);
	for (var i in allKeys) {
	    var key = allKeys[i];
	    var exportedPublicKey = JSON.parse(items[key]["SECURE_CLOUD_PUBLICKEY"]);
	    import_public_key(key, exportedPublicKey);
	    var exportedPrivateKey = JSON.parse(items[key]["SECURE_CLOUD_PRIVATEKEY"]);
	    import_private_key(key, exportedPrivateKey);
	}
});
