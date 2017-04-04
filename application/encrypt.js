// Fix Apple prefix if needed
if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
window.crypto.subtle = window.crypto.webkitSubtle;  // Won't work if subtle already exists
}

if (!window.crypto || !window.crypto.subtle) {
alert("Your current browser does not support the Web Cryptography API! This page will not work.");

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
			var reader = new FileReader();
			reader.onload = function (readerEvt) {
				console.log("Upload last step");
				portObject.postMessage({
		        	type: "uploadFile",
		        	file: btoa(readerEvt.target.result),
		        	fileName : file.name,
		        	encryptedKey : arrayBufferToBase64(data.encryptedKey)
		        });
			};
			reader.onerror = function (error) {
			   	console.log('Error: ', error);
			};
	        reader.readAsBinaryString(data.encryptedFile);
	   	}).
		catch(function(err) {
			console.log("Something went wrong encrypting: " + err.message + "\n" + err.stack);
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
                       
function uploadFile(url, file) {
	encryptTheFile(file, publicKeys[url]);
}
