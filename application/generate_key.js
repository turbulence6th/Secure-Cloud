var hostname = ""
//CONVERT PEM FILEEEEEE
function arrayBufferToBase64(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for(var i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
}

function addNewLines(str) {
    var finalString = '';
    while(str.length > 0) {
        finalString += str.substring(0, 64) + '\n';
        str = str.substring(64);
    }

    return finalString;
}

function toPemPub(privateKey) {
    var b64 = addNewLines(arrayBufferToBase64(privateKey));
    var pem = "-----BEGIN PUBLIC KEY-----\n" + b64 + "-----END PUBLIC KEY-----";
    
    return pem;
}
function toPemPri(privateKey) {
    var b64 = addNewLines(arrayBufferToBase64(privateKey));
    var pem = "-----BEGIN PRIVATE KEY-----\n" + b64 + "-----END PRIVATE KEY-----";
    
    return pem;
}

//CONVERT PEM FILEEEEEE

//CONVERT RSA-KEY


function removeLines(str) {
	return str.replace("\n", "");
}

function base64ToArrayBuffer(b64) {
    var byteString = window.atob(b64);
    var byteArray = new Uint8Array(byteString.length);
    for(var i=0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    return byteArray;
}

function pemToArrayBufferPri(pem) {
    var b64Lines = removeLines(pem);
    var b64Prefix = b64Lines.replace('-----BEGIN PRIVATE KEY-----', '');
    var b64Final = b64Prefix.replace('-----END PRIVATE KEY-----', '');

    return base64ToArrayBuffer(b64Final);
}

function pemToArrayBufferPub(pem) {
    var b64Lines = removeLines(pem);
    var b64Prefix = b64Lines.replace('-----BEGIN PUBLIC KEY-----', '');
    var b64Final = b64Prefix.replace('-----END PUBLIC KEY-----', '');

    return base64ToArrayBuffer(b64Final);
}

function downloadit(yazi,param){
		console.log(yazi);
		var link = document.createElement('a');
		link.download = param;
		var blob = new Blob([yazi], {type: 'text/plain'});
		link.href = window.URL.createObjectURL(blob);
		link.click();
}

function importPrivateKey(param){
	window.crypto.subtle.importKey(
    	"pkcs8",
    	pemToArrayBufferPri(param),
    	{
        name: "RSA-OAEP",
        hash: {name: "SHA-256"} // or SHA-512
    	},
    	true,
    	["decrypt"]
		).then(function(importedPrivateKey) {
    		console.log(importedPrivateKey);
		}).catch(function(err) {
    	console.log(err);
		});
}	

/*************** GENERATE KEY    ***************************/
function generate_key() {
	var keyname = $("#keyname").val();
	var algo = $("#algo").val();
	// generate rsa keys
	var keyPair;
	createAndSaveAKeyPair(algo).then(exportPublicKey);

}

	
function exportPublicKey(key) {
	window.crypto.subtle.exportKey(
		"jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
		key.publicKey //can be a publicKey or privateKey, as long as extractable was true
	)
	.then(function(keydata){
		var result = {};
		result.publicKey = keydata;
		result.key = key;
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
		var result = {};
		console.log(keydata);
		result.publicKey = JSON.stringify(param.publicKey);
		result.privateKey = JSON.stringify(keydata);
		result.key = param.key;
		// send public key to the server
		owncloudSendPublicKey(result.publicKey,result.privateKey);
	})
	.catch(function(err){
		console.error(err);
	});
}


		
function createAndSaveAKeyPair(algo) {

	// Side effect: updates keyPair in enclosing scope with new value.
	return window.crypto.subtle.generateKey(
	    {
		name: algo,
		modulusLength: 2048,
		publicExponent: new Uint8Array([1, 0, 1]),  //65537 24 bit gösterimi
		hash: {name: "SHA-256"}
	    },
	    true,   
	    ["encrypt", "decrypt"]).
		then(function (key) {
	    	keyPair = key;
	    	console.log(key);
	    	return key;
		});

}

function owncloudSendPublicKey(publicKey,privateKey) {

	for(var i in ports){
		var port = ports[i];
		port.postMessage({
			type: "generateKey",
			key: publicKey
		});
		port.onMessage.addListener(function(request, port) {
	      if(request.type == 'generateKey') {
	        if(request.success) {
	          	console.log("key has been saved");
	          	
	        }
	      }
	    });
	}



}


// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('generate-key').addEventListener('click', generate_key);
  
});
