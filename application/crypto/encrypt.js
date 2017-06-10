
// Click handlers to encrypt or decrypt the given file:
function uploadFile(
			file,
			filename,
			sessionkey,
        	sessioniv,
        	secretkey, 
        	secretiv,
        	shares
         ) {

	var sessionKey = forge.random.getBytesSync(16);
	var iv = forge.random.getBytesSync(16);

	// if the file is already exist
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

	// share 
	var shareSessionKeys = [];
	for (var i in shares) {
		var share = shares[i];
		if (share.type == "user") {
			var userPublicKey = pki.publicKeyFromPem(share.publickey);
			var userSessionKey = userPublicKey.encrypt(sessionKey, 'RSA-OAEP');
			shareSessionKeys.push({type: 'user', username: share.username, sessionkey: btoa(unescape(encodeURIComponent(userSessionKey)))});
		} else if (share.type == "group") {
			var groupSecretKey = decodeURIComponent(escape(atob(share.secretkey)));
			var groupSecretIv = secretiv = decodeURIComponent(escape(atob(share.secretiv)));
			var cipher = forge.cipher.createCipher('AES-CBC', groupSecretKey);
			// encrypt plain text
			cipher.start({iv: groupSecretIv});
			cipher.update(forge.util.createBuffer(sessionKey));
			cipher.finish();
			var groupSessionKey = cipher.output.getBytes();
			shareSessionKeys.push({type: 'group', groupname: share.groupname, sessionkey: btoa(unescape(encodeURIComponent(groupSessionKey)))});

		}
	}
		
	console.log("Upload last step");
	portObject.postMessage({
    	type: "uploadFile",
    	file: encrypted64,
    	iv: btoa(unescape(encodeURIComponent(iv))),
    	fileName : filename,
    	encryptedKey : btoa(unescape(encodeURIComponent(encryptedSessionKey))),
    	shares : shareSessionKeys
    });

}


