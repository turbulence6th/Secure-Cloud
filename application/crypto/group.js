
function createCryptoGroup(groupname) {

	var secretKey = forge.random.getBytesSync(16);
	var iv = forge.random.getBytesSync(16);
	var encryptedSecretKey = publicKey.encrypt(secretKey, 'RSA-OAEP');
	portObject.postMessage({
		type: 'createCryptoGroup',
		groupname: groupname,
		iv : btoa(unescape(encodeURIComponent(iv))),
		secretKey: btoa(unescape(encodeURIComponent(encryptedSecretKey)))
	});
	console.log("new crypto group: " + groupname);
}

function AddNewMemberToGroupRequest(username,groupname,encryptedSecretKey,userPublicKey, iv) {

	encryptedSecretKey = decodeURIComponent(escape(atob(encryptedSecretKey)));
	userPublicKey = pki.publicKeyFromPem(userPublicKey);
    var secretKey = privateKey.decrypt(encryptedSecretKey, 'RSA-OAEP'); 
    var newSecretKey = userPublicKey.encrypt(secretKey, 'RSA-OAEP');
	portObject.postMessage({
		type: "addMember",
		username: username,
		groupname: groupname,
		iv: iv,
		secretKey: btoa(unescape(encodeURIComponent(newSecretKey)))
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


function groupShare(groupSecret, secretiv, sessionKey, sessioniv, fileId, groupname) {
		
	var encryptedSecret = decodeURIComponent(escape(atob(groupSecret)));
    var encryptedSessionKey = decodeURIComponent(escape(atob(sessionKey)));
    var secretiv = decodeURIComponent(escape(atob(secretiv)));

	var sessionKey = privateKey.decrypt(encryptedSessionKey, 'RSA-OAEP');
    var secretKey = privateKey.decrypt(encryptedSecret, 'RSA-OAEP');

    var cipher = forge.cipher.createCipher('AES-CBC', secretKey);
    cipher.start({iv: secretiv});
    cipher.update(forge.util.createBuffer(sessionKey));
    cipher.finish();

    var encrypted = cipher.output.data;
    var encrypted64 = btoa(unescape(encodeURIComponent(encrypted)));

    portObject.postMessage({
      type: "shareGroup",
      fileId: fileId,
      sharedWith: groupname,
      sessioniv: sessioniv,
      encryptedSessionKey: encrypted64
    });


	}



