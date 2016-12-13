var url = window.location.origin;
// this fileId will be selected row id, it just for a test if it runs 
var fileId  = 373;

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

// save blob data to local disk
var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var blob = new Blob([data], {type: "application/octet-stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

function base64ToArrayBuffer(b64) {
    var byteString = window.atob(b64);
    var byteArray = new Uint8Array(byteString.length);
    for(var i=0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    return byteArray;
}


// download file function
function downloadFile() {
	$.ajax({	
		url : url + '/owncloud/index.php/apps/endtoend/downloadFile',
		data :  {
			fileId : fileId
		},
		//dataType : 'json',
		type : 'GET',
		success : function(data) {

			var file = new Blob([base64ToArrayBuffer(data.file)], {type: "application/octet-stream"});
			var sessionKey = base64ToArrayBuffer(data.sessionKey);
			var filename = data.fileName;
			decryptTheFile(file,filename,privateKey,sessionKey);
			


		},
		async : true
	});	
}


function decryptTheFile(file,filename,privateKey,sessionKey) {
    // Click handler. Reads the selected file, then decrypts it to
    // the random key pair's private key. Creates a Blob with the result,
  
  	file = new File([file], "deneme", {type: "application/octet-stream" });
    var sourceFile = file; 
    
    var reader = new FileReader();
    reader.onload = processTheFile;
    reader.readAsArrayBuffer(sourceFile);

    function processTheFile() {
    // Load handler for file reader. Needs to reference keyPair from
    // enclosing scope.
    var reader = this;              // Invoked by the reader object
    var data = reader.result;

    // First, separate out the relevant pieces from the file.
    var keyLength       = new Uint16Array(data, 0, 2)[0];   // First 16 bit integer
    var encryptedKey    = new Uint8Array( data, 2,              keyLength);
    var iv              = new Uint8Array( data, 2 + keyLength,  16);
    var ciphertext      = new Uint8Array( data, 2 + keyLength + 16);
    var encryptedKey = sessionKey;

    decrypt(ciphertext, iv, encryptedKey, privateKey).
    then(function(blob) {
         //return blob;
         saveData(blob,filename);
         
         }).
    catch(function(err) {
          alert("Something went wrong decrypting: " + err.message + "\n" + err.stack);
          });
    
    
    function decrypt(ciphertext, iv, encryptedSessionKey, privateKey) {
    // Returns a Promise the yields a Blob containing the decrypted ciphertext.
    console.log("decrypt");
    return decryptKey(encryptedSessionKey, privateKey).
    then(importSessionKey).
    then(decryptCiphertext);
    
    
    function decryptKey(encryptedKey, privateKey) {
    console.log(encryptedKey);
    console.log(privateKey);
    // Returns a Promise that yields a Uint8Array AES key.
    // encryptedKey is a Uint8Array, privateKey is the privateKey
    // property of a Key key pair.
    return window.crypto.subtle.decrypt({name: "RSA-OAEP"}, privateKey, encryptedKey);
    }
    
    
    function importSessionKey(keyBytes) {
    console.log("import session key");
    // Returns a Promise yielding an AES-CBC Key from the
    // Uint8Array of bytes it is given.
    
    return window.crypto.subtle.importKey(
                                          "raw",
                                          keyBytes,
                                          {name: "AES-CBC", length: 128},
                                          true,
                                          ["encrypt", "decrypt"]
                                          );
    }
    
    function decryptCiphertext(sessionKey) {
    // Returns a Promise yielding a Blob containing the decryption of ciphertext
    // (from an enclosing scope) using the sessionKey and the iv
    // (initialization vector, from an enclosing scope).
    return window.crypto.subtle.decrypt({name: "AES-CBC", iv: iv}, sessionKey, ciphertext).
    then(function(plaintext) {
         return new Blob([new Uint8Array(plaintext)], {type: "application/octet-stream"});
         });
    }
    
    } // end of decrypt
    } // end of processTheFile
    } // end of decryptTheFile


// bind the downloadFile button to download function
document.getElementById("downloadFile").addEventListener("click",downloadFile);
