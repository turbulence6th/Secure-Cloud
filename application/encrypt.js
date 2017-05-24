
// Click handlers to encrypt or decrypt the given file:
function encryptTheFile(file,filename) {


	var sessionKey = forge.random.getBytesSync(16);
	var iv = forge.random.getBytesSync(16);
	var cipher = forge.cipher.createCipher('AES-CBC', sessionKey);
	// encrypt plain text
	cipher.start({iv: iv});
	cipher.update(forge.util.createBuffer(file));
	cipher.finish();

	var encrypted = cipher.output.getBytes();
	var encrypted64 = forge.util.encode64(encrypted);
	console.log(encrypted64);
	// encrypt session key
	var encryptedSessionKey = publicKey.encrypt(sessionKey, 'RSA-OAEP');
		
	console.log("Upload last step");
	portObject.postMessage({
    	type: "uploadFile",
    	file: encrypted64,
    	iv: btoa(unescape(encodeURIComponent(iv))),
    	fileName : filename,
    	encryptedKey : btoa(unescape(encodeURIComponent(encryptedSessionKey)))
    });

}

                       
function uploadFile(file, filename) {
	encryptTheFile(file, filename);
}
