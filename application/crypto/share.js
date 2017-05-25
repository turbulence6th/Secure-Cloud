
function shareFile(publicKey, sessionKey, iv, fileId, sharedWith) {
	console.log("file sharing");
	var userPublicKey = pki.publicKeyFromPem(publicKey);
    var sessionKey = decodeURIComponent(escape(atob(sessionKey)));
    sessionKey = privateKey.decrypt(sessionKey, 'RSA-OAEP');
    var encryptSessionKey = userPublicKey.encrypt(sessionKey, 'RSA-OAEP');
    portObject.postMessage({
      type: "shareFile",
      fileId: fileId,
      sharedWith: sharedWith,
      sessionKey: btoa(unescape(encodeURIComponent(encryptSessionKey))),
      iv: iv
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