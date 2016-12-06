
// Fix Apple prefix if needed
if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
window.crypto.subtle = window.crypto.webkitSubtle;  // Won't work if subtle already exists
}

if (!window.crypto || !window.crypto.subtle) {
alert("Your current browser does not support the Web Cryptography API! This page will not work.");

}

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


function arrayBufferToBase64(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for(var i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
}


// Click handlers to encrypt or decrypt the given file:
function encryptTheFile(file,publicKey) {
// Click handler. Reads the selected file, then encrypts it to
// the random key pair's public key. Creates a Blob with the result,
// and places a link to that Blob in the download-results section.

	var sourceFile = file;

	var reader = new FileReader();
	reader.onload = processTheFile;
	reader.readAsArrayBuffer(sourceFile);

	// Asynchronous handler:
	function processTheFile() {
		// Load handler for file reader. Needs to reference keyPair from
		// enclosing scope.

		var reader = this;              // Was invoked by the reader object
		var plaintext = reader.result;
		encrypt(plaintext, publicKey).
		then(function(data) {
			var formData = new FormData();
			console.log(data.encryptedFile);
			console.log(arrayBufferToBase64(data.encryptedKey));
			formData.append('file',data.encryptedFile, file.name);
			formData.append('encryptedKey', arrayBufferToBase64(data.encryptedKey));		
			$.ajax({	
				url : 'https://144.122.129.24/owncloud/index.php/apps/endtoend/fileUpload',
				data : formData,
				cache : false,
				contentType : false,
				processData : false,
				type : 'POST',
				success : function(data) {
					if(data.success){
						refresh();
					}
				}
			});	
	   	}).
		catch(function(err) {
			alert("Something went wrong encrypting: " + err.message + "\n" + err.stack);
		});
	


function encrypt(plaintext,publicKey) {
// Returns a Promise that yields a Blob to its
// then handler. The Blob points to an encrypted
// representation of the file. The structure of the
// Blob's content's structure:
//    16 bit integer length of encrypted session key
//    encrypted session key
//    128 bit (16 byte) iv (initialization vector)
//    AES-CBC encryption of plaintext using session key and iv

var sessionKey, encryptedFile;  // Used in two steps, so saved here for passing

return window.crypto.subtle.generateKey(
                                      {name: "AES-CBC", length: 128},
                                      true,
                                      ["encrypt", "decrypt"]).
then(saveSessionKey).           // Will be needed later for exportSessionKey
then(encryptPlaintext).
then(saveEncryptedFile).        // Will be needed later for packageResults
then(exportSessionKey).
then(encryptSessionKey).
then(packageResults);


// The handlers for each then clause:

function saveSessionKey(key) {
// Returns the same key that it is provided as its input.
// Side effect: updates sessionKey in the enclosing scope.
sessionKey = key;
return sessionKey;
}

function encryptPlaintext(sessionKey) {
// Returns a Promise that yields an array [iv, ciphertext]
// that is the result of AES-CBC encrypting the plaintext
// from the enclosing scope with the sessionKey provided
// as input.
//
// Both the iv (initialization vector) and ciphertext are
// of type Uint8Array.
var iv = window.crypto.getRandomValues(new Uint8Array(16));

return window.crypto.subtle.encrypt({name: "AES-CBC", iv: iv}, sessionKey, plaintext).
then(function(ciphertext) {
   return [iv, new Uint8Array(ciphertext)];
   });
}

function saveEncryptedFile(ivAndCiphertext) {
// Returns nothing. Side effect: updates encryptedFile in the enclosing scope.
encryptedFile = ivAndCiphertext;
}

function exportSessionKey() {
// Returns a Promise that yields an ArrayBuffer export of
// the sessionKey found in the enclosing scope.
console.log(sessionKey);
return window.crypto.subtle.exportKey('raw', sessionKey);
}

function encryptSessionKey(exportedKey) {
console.log(exportedKey);
// Returns a Promise that yields an ArrayBuffer containing
// the encryption of the exportedKey provided as a parameter,
// using the publicKey found in an enclosing scope.

return window.crypto.subtle.encrypt({name: "RSA-OAEP"}, publicKey, exportedKey);
}

function packageResults(encryptedKey) {
	console.log(encryptedKey);
// Returns a Blob representing the package of
// the encryptedKey it is provided and the encryptedFile
// (in an enclosing scope) that was created with the
// session key.

	var length = new Uint16Array([encryptedKey.byteLength]);
	return { "encryptedKey": encryptedKey,
	"encryptedFile": new Blob(
              [
               length,             // Always a 2 byte unsigned integer
               encryptedKey,       // "length" bytes long
               encryptedFile[0],   // 16 bytes long initialization vector
               encryptedFile[1]    // Remainder is the ciphertext
               ],
              {type: "application/octet-stream"}
              )
	};
}

} // End of encrypt
} // end of processTheFile
} // end of encryptTheFile click handler
                        

            



function uploadFile() {
	

	var file = document.getElementById('file').files[0];
	console.log(publicKey);
	encryptTheFile(file,publicKey);
}

document.getElementById("submitFile").addEventListener("click",uploadFile);
