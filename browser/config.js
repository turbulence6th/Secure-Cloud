var url = window.location.origin;
// this fileId will be selected row id, it just for a test if it runs 
var fileId  = 23;

var exportedPublicKey;
var publicKey;


// import public key
function import_public_key(exportedPublicKey) {	
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
		publicKey = key;
		console.log(publicKey);
		
	})
	.catch(function(err){
	    //console.error(err);
	    console.log("bug");
	});
}


chrome.storage.sync.get("SECURE_CLOUD_PUBLIC_KEY", function(data)
{
    if(chrome.runtime.lastError)
    {
        /* error */

        return;
    }

     exportedPublicKey = JSON.parse(data.SECURE_CLOUD_PUBLIC_KEY);
     console.log(exportedPublicKey);
	import_public_key(exportedPublicKey);


});


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



function arrayBufferToBase64(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for(var i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
}

function base64ToArrayBuffer(b64) {
    var byteString = window.atob(b64);
    var byteArray = new Uint8Array(byteString.length);
    for(var i=0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    return byteArray;
}




