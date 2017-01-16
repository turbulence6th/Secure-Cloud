

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
		$.ajax({	
			url : url + '/owncloud/index.php/apps/endtoend/createCryptoGroup',
			data :  {
				groupName : groupname,
				secretKey : arrayBufferToBase64(sessionKey),
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

}

function decryptKey(encryptedKey, privateKey) {
    // Returns a Promise that yields a Uint8Array AES key.
    // encryptedKey is a Uint8Array, privateKey is the privateKey
    // property of a Key key pair.
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



function AddNewMemberToGroup(groupname, username) {


	$.ajax({	
		url : url + '/owncloud/index.php/apps/endtoend/preAddNewMemberToGroup',
		data :  {
			groupName : groupname,
			username : username,
		},
		//dataType : 'json',
		type : 'POST',
		success : function(data) {
			if (data.success) {
				console.log("preyi gectik");
				var encryptedSecret = base64ToArrayBuffer(data.secretKey);
				var userPublicKey = JSON.parse(data.publicKey);
				console.log(userPublicKey);
				window.crypto.subtle.importKey(
				    "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
				    userPublicKey,
				    {   //these are the algorithm options
					name: "RSA-OAEP",
					hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
				    },
				    true, //whether the key is extractable (i.e. can be used in exportKey)
				    ["encrypt"] //"encrypt" or "wrapKey" for public key import or
						//"decrypt" or "unwrapKey" for private key imports
				).
				then(function(data) { userPublicKey = data; return decryptKey(encryptedSecret,privateKey)}).
				then(function(data) {return encryptUserSessionKey(data,userPublicKey)}).
				then(AddNewMemberToGroupRequest);

			}

		},
		async : true
	});

	function AddNewMemberToGroupRequest(sessionKey) {

		console.log("buraya geldik");
		console.log(sessionKey);
		$.ajax({	
			url : url + '/owncloud/index.php/apps/endtoend/addNewMemberToGroup',
			data :  {
				groupName : groupname,
				username : username,
				secretKey : arrayBufferToBase64(sessionKey),
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
	var iv = "2oGfnx23bDl4BHEbujwm2g==";
	iv = base64ToArrayBuffer(iv);
	return window.crypto.subtle.encrypt({name: "AES-CBC", iv: iv}, groupSecret, sessionKey);
}

function ShareWithGroup(fileId, groupname,permissions) {

	var sessionKey,publicKey;
	$.ajax({	
		url : url + '/owncloud/index.php/apps/endtoend/preShareWithGroup',
		data :  {
			fileId : fileId,
			sharedWith : groupname,
			
		},
		//dataType : 'json',
		type : 'POST',
		success : function(data) {
			if (data.success) {
				var encryptedSecret = base64ToArrayBuffer(data.groupSecret);
				var sessionKey = base64ToArrayBuffer(data.sessionKey);
	
    			decryptKey(sessionKey,privateKey).
    			//then(importSessionKey).
				then(function(param) { sessionKey = param; return decryptKey(encryptedSecret,privateKey);}).
				then(importSessionKey).
				then( function(groupSecret) { return encryptSessionKeyWithGroupSecret(groupSecret,sessionKey);}).
				then(ShareWithGroupRequest);
			}
		},
		async : true
	});

	function ShareWithGroupRequest(encryptedSessionKey) {
		$.ajax({	
			url : url + '/owncloud/index.php/apps/endtoend/shareWithGroup',
			data :  {
				fileId : fileId,
				sharedWith : groupname,
				encryptedSessionKey : arrayBufferToBase64(encryptedSessionKey),
				read : permissions["read"],
				update : permissions["update"],
				create : permissions["create"],
				delete : permissions["delete"],
				share : permissions["share"],
				changeShare : permissions["changeShare"]
	
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
    

}


var groupname = "denemegroup5";
var groupPermissions = {

	"read" : true,
	"update" : true,
	"create" : false,
	"delete" : false,
	"share" : false,
	"changeShare" : false
};

//createCryptoGroup(groupname);
//AddNewMemberToGroup(groupname,"user");
//ShareWithGroup(23,groupname,groupPermissions);
//then(function() {AddNewMemberToGroup(groupname,"user")}).
//then(function() {ShareWithGroup(23,groupname,groupPermissions)});