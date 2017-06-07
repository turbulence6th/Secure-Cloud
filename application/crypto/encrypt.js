
// Click handlers to encrypt or decrypt the given file:
function uploadFile(
			file,
			filename,
			sessionkey,
        	sessioniv,
        	secretkey, 
        	secretiv
         ) {

	var sessionKey = forge.random.getBytesSync(16);
	var iv = forge.random.getBytesSync(16);

	if (secretkey) {
		secretkey = decodeURIComponent(escape(atob(secretkey)));
		secretiv = decodeURIComponent(escape(atob(secretiv)));
		sessionkey = decodeURIComponent(escape(atob(sessionkey)));
		sessioniv = decodeURIComponent(escape(atob(sessioniv)));
		secretkey = privateKey.decrypt(secretkey,'RSA-OAEP');
		var decipher = forge.cipher.createDecipher('AES-CBC', secretkey);
        decipher.start({iv: secretiv});
        decipher.update(forge.util.createBuffer(sessionkey));
        decipher.finish();
        sessionKey = decipher.output.getBytes();
        iv = sessioniv;
	} else if (sessionkey) {
		sessionkey = decodeURIComponent(escape(atob(sessionkey)));
		sessioniv = decodeURIComponent(escape(atob(sessioniv)));
		sessionKey = privateKey.decrypt(sessionkey,'RSA-OAEP');
		iv = sessioniv;
	}

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


