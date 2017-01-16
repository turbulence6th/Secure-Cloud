var hostname;
chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    hostname = new URL(tabs[0].url).origin;
});
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




    //CONVERT RSA-KEY
var kkkkk;
function generate_key() {
	
	// generate rsa keys
		var keyPair;
		createAndSaveAKeyPair().then(exportPublicKey);

}

function downloadit(yazi,param){
		console.log(yazi);
		var link = document.createElement('a');
		link.download = param;
		var blob = new Blob([yazi], {type: 'text/plain'});
		link.href = window.URL.createObjectURL(blob);
		link.click();
}
		
function exportPublicKey(key) {
	window.crypto.subtle.exportKey(
		"jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
		key.publicKey //can be a publicKey or privateKey, as long as extractable was true
	)
	.then(function(keydata){
		//returns the exported key data
		//console.log("aaaaaaaaaaaaa"+keydata);
		var result = {};
		console.log(keydata);
		result.publicKey = keydata;
		result.key = key;
		//console.log(toPemPub(keydata));
		
		//var sitring = toPemPub(keydata);
		//document.getElementById('downpub').onclick=function() {downloadit(toPemPub(keydata),'key.pub')};
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
		console.log(keydata);
		result.publicKey = JSON.stringify(param.publicKey);
		result.privateKey = JSON.stringify(keydata);
		result.key = param.key;
		//console.log(toPemPri(keydata));
		//document.getElementById('downpri').onclick=function(){downloadit(toPemPri(keydata),'key.pri')};

		// send public key to the server
		owncloudSendPublicKey(result.publicKey,result.privateKey);
	})
	.catch(function(err){
		console.error(err);
	});
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
	    //kkkkk=key;
	    console.log(key);
	    return key;
	});

}

function owncloudSendPublicKey(publicKey,privateKey) {

	var http = new XMLHttpRequest();
	var url = hostname + "/owncloud/index.php/apps/endtoend/setPublicKey";
	console.log(publicKey);
	console.log(privateKey);	

	var data={};
	data.key = publicKey;
	
	var string = JSON.stringify(data);

	

	http.open('POST',url,true);
	http.setRequestHeader("Content-type", "application/json; charset=utf-8");

	http.onreadystatechange = function() {//Call a function when the state changes.
		if(http.readyState == 4 && http.status == 200) {
			data.resp = JSON.parse(http.responseText);
			if(data.resp.login==false){
				alert('You have to login first');
			}else{
				if (data.resp.success == true) {
					alert("RSA Key pair has succesfully created and public key has sent to server");
					chrome.storage.sync.set({"SECURE_CLOUD_PUBLIC_KEY" : publicKey}, function() {
					  // Notify that we saved.
					  alert('Public key saved');
					});
					chrome.storage.sync.set({"SECURE_CLOUD_PRIVATE_KEY" : privateKey}, function() {
					  // Notify that we saved.
					  alert('Private key saved');
					});
				} else {
					alert("You have already generated a key pair");
				}
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
