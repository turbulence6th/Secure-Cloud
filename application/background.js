chrome.app.runtime.onLaunched.addListener(function() {
  // Center window on screen.
  var screenWidth = screen.availWidth;
  var screenHeight = screen.availHeight;
  var width = 500;
  var height = 300;

  chrome.app.window.create('index.html', {
    id: "Secure Cloud"

  });
});

var portObject, portNative;
portNative = chrome.runtime.connectNative("com.securecloud");
portNative.onMessage.addListener(function (request, port) {
  
});
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    debugger;
  }
);

chrome.runtime.onConnectExternal.addListener(function(port) {
  portObject = port;
  port.onMessage.addListener(function(request, port) {
    if(request.type == "uploadFile") {
      uploadFile(request.file, request.fileName);
    }
	else if(request.type == 'login') {
      var hasKey = false;
      chrome.storage.local.get(null,function(items) {
        if (items[request.url] && items[request.url]["SECURE_CLOUD_MATCHUP"] ) {
          hasKey = true;
        }
        console.log("Key found status: " + hasKey);
        if (hasKey == true) {
      	   if (items[request.url]["SECURE_CLOUD_KEY_NAME"] == "SECURE_CLOUD_SMARTCARD") {
    			   setKeysFromSmartCard();
    		  } else {
    			   setKeys(items[request.url]["SECURE_CLOUD_KEY_NAME"]);
    		  }
	       }
        portObject.postMessage({
          type: "hasKey",
          found: hasKey
        }); 
		});
	}

    else if(request.type == "downloadFile") {
      var file = request.file;
      var iv = decodeURIComponent(escape(atob(request.iv)));
      var sessionKey = decodeURIComponent(escape(atob(request.sessionKey)));
      var secretKey = request.secretKey;
      var filename = request.fileName;

      decryptTheFile(file, iv, filename, privateKey, sessionKey, secretKey);
    }

    else if(request.type == "shareFile") {
      var userPublicKey = pki.publicKeyFromPem(request.publicKey);
      var sessionKey = privateKey.decrypt(atob(request.sessionKey), 'RSA-OAEP');
      var encryptSessionKey = userPublicKey.encrypt(sessionKey, 'RSA-OAEP');
      var iv = request.iv;
      var fileId = request.fileId;
      var sharedWith = request.sharedWith;
	  shareFile(encryptSessionKey, iv, sharedWith, fileId);
      
    }
    

  else if(request.type == 'createCryptoGroup') {
    createCryptoGroup(request.groupname);
  }

  else if(request.type == 'addMember') {
    console.log(request.publicKey);
    var username = request.member;
    var groupname = request.groupname;
    var encryptedSecretKey = atob(request.secretKey);
    var userPublicKey = request.publicKey;
    AddNewMemberToGroupRequest(username, groupname, encryptedSecretKey, userPublicKey);
    
  }

  else if(request.type == 'shareGroup') {
    var encryptedSecret = base64ToArrayBuffer(request.groupSecret);
    var sessionKey = base64ToArrayBuffer(request.sessionKey);

    fileId2 = request.fileId;
    groupname = request.sharedWith;

    decryptKey(sessionKey,privateKey).
      //then(importSessionKey).
    then(function(param) { sessionKey = param; return decryptKey(encryptedSecret,privateKey);}).
    then(importSessionKey).
    then( function(groupSecret) { return encryptSessionKeyWithGroupSecret(groupSecret,sessionKey);}).
    then(ShareWithGroupRequest);
  }

  });

  port.onDisconnect.addListener(function(port) {
   
  })
});
