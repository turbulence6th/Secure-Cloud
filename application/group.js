var fileId2, groupname;

function createCryptoGroup(groupname) {

	var secretKey = forge.random.getBytesSync(16);
	var iv = forge.random.getBytesSync(16);
	var encryptedSecretKey = publicKey.encrypt(secretKey, 'RSA-OAEP');
	portObject.postMessage({
		type: 'createCryptoGroup',
		groupname: groupname,
		iv : btoa(iv),
		secretKey: btoa(encryptedSecretKey)
	});
	console.log("new crypto group: " + groupname);
}

function AddNewMemberToGroupRequest(username,groupname,encryptedSecretKey,userPublicKey) {

	userPublicKey = pki.publicKeyFromPem(userPublicKey);
    var secretKey = privateKey.decrypt(encryptedSecretKey, 'RSA-OAEP'); 
    var newSecretKey = userPublicKey.encrypt(secretKey, 'RSA-OAEP');
	portObject.postMessage({
		type: "addMember",
		username: username,
		groupname: groupname,
		secretKey: btoa(newSecretKey)
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
			fileId: fileId2,
			sharedWith: groupname,
			encryptedSessionKey: arrayBufferToBase64(encryptedSessionKey)
		});


	}



