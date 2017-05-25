

function shareFile(sharedType, sharedWith, publicKey, sessionKeys, fileId, groupSecret, secretiv) {
	console.log("file sharing");
	var response = [];

	if (sharedType == "user") {
		var userPublicKey = pki.publicKeyFromPem(publicKey);
		for (var i in sessionKeys) {
			var key = sessionKeys[i];	
			if (key.type == 'user') {
				var sessionKey = decodeURIComponent(escape(atob(key.sessionKey)));
				sessionKey = privateKey.decrypt(sessionKey, 'RSA-OAEP');
	    		var encryptSessionKey = userPublicKey.encrypt(sessionKey, 'RSA-OAEP');
	    		response.push({
	    			sessionKey: btoa(unescape(encodeURIComponent(encryptSessionKey))),
	    			sessioniv: key.sessioniv,
	    			fileId: key.fileId
	    		});
			} else if (key.type == "group") {
				var sessionKey = decodeURIComponent(escape(atob(key.sessionKey)));
				var encryptedSecret = decodeURIComponent(escape(atob(key.groupSecret)));
				var secretiv = decodeURIComponent(escape(atob(key.secretiv)));
				var secretKey = privateKey.decrypt(encryptedSecret, 'RSA-OAEP');
				
				var decipher = forge.cipher.createDecipher('AES-CBC', secretKey);
		        decipher.start({iv: secretiv});
		        decipher.update(forge.util.createBuffer(sessionKey));
		        decipher.finish();

		        sessionKey = decipher.output.data;
		        var encryptSessionKey = userPublicKey.encrypt(sessionKey, 'RSA-OAEP');
			    
			    response.push({
	    			sessionKey: btoa(unescape(encodeURIComponent(encryptSessionKey))),
	    			sessioniv: key.sessioniv,
	    			fileId: key.fileId
	    		});
			}
		} 
	} else if (sharedType == "group") {
		for (var i in sessionKeys) {
			var key = sessionKeys[i];	
			if (key.type == 'user') {
				var sessionKey = decodeURIComponent(escape(atob(key.sessionKey)));
				sessionKey = privateKey.decrypt(sessionKey, 'RSA-OAEP');

				groupSecret = decodeURIComponent(escape(atob(groupSecret)));
				secretiv = decodeURIComponent(escape(atob(secretiv)));
				groupSecret = privateKey.decrypt(groupSecret, 'RSA-OAEP');
	    		var cipher = forge.cipher.createCipher('AES-CBC', groupSecret);
			    cipher.start({iv: secretiv});
			    cipher.update(forge.util.createBuffer(sessionKey));
			    cipher.finish();

			    var encrypted = cipher.output.data;
			    var encrypted64 = btoa(unescape(encodeURIComponent(encrypted)));
	    		response.push({
	    			sessionKey: encrypted64,
	    			sessioniv: key.sessioniv,
	    			fileId: key.fileId
	    		});
			} else if (key.type == "group") {
				var sessionKey = decodeURIComponent(escape(atob(key.sessionKey)));
				var encryptedSecret = decodeURIComponent(escape(atob(key.groupSecret)));
				var keysecretiv = decodeURIComponent(escape(atob(key.secretiv)));
				var secretKey = privateKey.decrypt(encryptedSecret, 'RSA-OAEP');

				var decipher = forge.cipher.createDecipher('AES-CBC', secretKey);
		        decipher.start({iv: keysecretiv});
		        decipher.update(forge.util.createBuffer(sessionKey));
		        decipher.finish();

		        sessionKey = decipher.output.data;

		        groupSecret = decodeURIComponent(escape(atob(groupSecret)));
		        secretiv = decodeURIComponent(escape(atob(secretiv)));
		        groupSecret = privateKey.decrypt(groupSecret, 'RSA-OAEP');
		        var cipher = forge.cipher.createCipher('AES-CBC', groupSecret);
			    cipher.start({iv: secretiv});
			    cipher.update(forge.util.createBuffer(sessionKey));
			    cipher.finish();

			    var encrypted = cipher.output.data;
			    var encrypted64 = btoa(unescape(encodeURIComponent(encrypted)));
	    		response.push({
	    			sessionKey: encrypted64,
	    			sessioniv: key.sessioniv,
	    			fileId: key.fileId
	    		});
			}
		} 

	}
	
    portObject.postMessage({
      type: "shareFile",
      sharedType: sharedType,
      sharedWith: sharedWith,
      sessionKeys: response,
      fileId: fileId 
    }); 
}


function unshareFile(fileId,username) {
	$.ajax({	

			url :  url + '/index.php/apps/endtoend/unshareFile',
			data :  {
				fileId : fileId,
				unsharedWith : username
			},
			//dataType : 'json',
			type : 'POST',
			success : function(data) {
				if (data.success) {
					console.log("The file has successfully unshared");
				}

			},
			async : true
		});	
}


function changeShareFile(fileId,username,permissions) {
	$.ajax({	
		url : url + '/index.php/apps/endtoend/changeShareFile',
		data :  {
			fileId : fileId,
			sharedWith : username,
			read : permissions["read"],
			update : permissions["update"],
			create : permissions["create"],
			delete : permissions["delete"],
			share : permissions["share"]
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