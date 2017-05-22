
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

		var sessionKey, encryptedFile;  // Used in two steps, so saved here for passing

		var sessionKey = forge.random.getBytesSync(16);
		var iv = forge.random.getBytesSync(16);
		var cipher = forge.cipher.createCipher('AES-CBC', sessionKey);
		// encrypt plain text
		cipher.start({iv: iv});
		cipher.update(forge.util.createBuffer(plaintext));
		cipher.finish();
		var encrypted = cipher.output;
		console.log(encrypted);

		// encrypt session key
		var encryptedSessionKey = publicKey.encrypt(sessionKey, 'RSA-OAEP');
			
		console.log("Upload last step");
		portObject.postMessage({
        	type: "uploadFile",
        	file: btoa(encrypted.data),
        	iv: btoa(iv),
        	fileName : file.name,
        	encryptedKey : btoa(encryptedSessionKey)
        });

	}
}

                       
function uploadFile(file) {
	encryptTheFile(file, publicKey);
}
