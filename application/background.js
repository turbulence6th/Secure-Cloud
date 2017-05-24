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
  
      decryptTheFile(request.file, request.sessioniv, request.secretiv, request.fileName, request.sessionKey, request.secretKey);
    }

    else if(request.type == "shareFile") {
      var userPublicKey = pki.publicKeyFromPem(request.publicKey);
      var sessionKey = decodeURIComponent(escape(atob(request.sessionKey)));
      sessionKey = privateKey.decrypt(sessionKey, 'RSA-OAEP');
      var encryptSessionKey = userPublicKey.encrypt(sessionKey, 'RSA-OAEP');

      portObject.postMessage({
        type: "shareFile",
        fileId: request.fileId,
        sharedWith: request.sharedWith,
        sessionKey: btoa(unescape(encodeURIComponent(encryptSessionKey))),
        iv: request.iv
      });
	   
    }
    

  else if(request.type == 'createCryptoGroup') {
    createCryptoGroup(request.groupname);
  }

  else if(request.type == 'addMember') {
    console.log(request.publicKey);
    var username = request.member;
    var groupname = request.groupname;
    var encryptedSecretKey = decodeURIComponent(escape(atob(request.secretKey)));
    var userPublicKey = request.publicKey;
    AddNewMemberToGroupRequest(username, groupname, encryptedSecretKey, userPublicKey, request.iv);
    
  }

  else if(request.type == 'shareGroup') {
    var encryptedSecret = decodeURIComponent(escape(atob(request.groupSecret)));
    var encryptedSessionKey = decodeURIComponent(escape(atob(request.sessionKey)));
    var secretiv = decodeURIComponent(escape(atob(request.secretiv)));

    var fileId = request.fileId;
    var groupname = request.sharedWith;

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
      sessioniv: request.sessioniv,
      encryptedSessionKey: encrypted64
    });

  
  }

  });

  port.onDisconnect.addListener(function(port) {
   
  })
});
