var username, groupname;

function exportSessionKey(sessionKey) {
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
function encryptUserSessionKey(exportedKey,userPublicKey) {
	console.log("encrypt user session key")
	console.log(exportedKey);
	// Returns a Promise that yields an ArrayBuffer containing
	// the encryption of the exportedKey provided as a parameter,
	// using the publicKey found in an enclosing scope.

	return window.crypto.subtle.encrypt({name: "RSA-OAEP"}, userPublicKey, exportedKey);
}

function createCryptoGroup(groupname) {
	return window.crypto.subtle.generateKey(
                                      {name: "AES-CBC", length: 128},
                                      true,
                                      ["encrypt", "decrypt"])

	.then(exportSessionKey)
	.then(encryptSessionKey)
	.then(createCryptoGroupRequest);

	function createCryptoGroupRequest(sessionKey) {
		portObject.postMessage({
			type: 'createCryptoGroup',
			groupname: groupname,
			secretKey: arrayBufferToBase64(sessionKey)
		});
	}

}

function decryptKey(encryptedKey, privateKey) {
    // Returns a Promise that yields a Uint8Array AES key.
    // encryptedKey is a Uint8Array, privateKey is the privateKey
    // property of a Key key pair.
    console.log("decrypt key");
    console.log(privateKey);
    console.log(encryptedKey);

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



function AddNewMemberToGroupRequest(sessionKey) {

	console.log("buraya geldik");
	console.log(sessionKey);

	portObject.postMessage({
		type: "addMember",
		username: username,
		groupname: groupname,
		secretKey: arrayBufferToBase64(sessionKey)
	});

}


function LeaveFromGroup(groupname) {


	$.ajax({	
		url : url + '/owncloud/index.php/apps/endtoend/leaveFromGroup',
		data :  {
			groupName : groupname,
		},
		//dataType : 'json',
		type : 'POST',
		success : function(data) {
			if (data.success) {

			}
		},
		async : true
	});

}

function encryptSessionKeyWithGroupSecret(groupSecret,sessionKey) {
	//var iv = window.crypto.getRandomValues(new Uint8Array(16));
	var siv = "2oGfnx23bDl4BHEbujwm2g==";
	siv = base64ToArrayBuffer(siv);
	return window.crypto.subtle.encrypt({name: "AES-CBC", iv: siv}, groupSecret, sessionKey);
}

function ShareWithGroupRequest(encryptedSessionKey) {
		
		console.log(encryptedSessionKey);

		portObject.postMessage({
			type: "shareGroup",
			fileId: fileId,
			sharedWith: groupname,
			encryptedSessionKey: arrayBufferToBase64(encryptedSessionKey)
		});


	}



