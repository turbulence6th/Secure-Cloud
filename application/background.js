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
  
  if (request.type == 'login') {
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
  else if(request.type == "uploadFile") {
    uploadFile(request.file, request.fileName);
  }
  else if(request.type == "downloadFile") {  
    decryptTheFile(request.file, request.sessioniv, request.secretiv, request.fileName, request.sessionKey, request.secretKey);
  }
  else if(request.type == "shareFile") { 
    shareFile(request.publicKey,request.sessionKey, request.iv, request.fileId, request.sharedWith);  
  }
  else if(request.type == 'createCryptoGroup') {
    createCryptoGroup(request.groupname);
  }
  else if(request.type == 'addMember') {
    AddNewMemberToGroupRequest(request.username, request.groupname, request.secretKey, request.publicKey, request.iv);
  }
  else if(request.type == 'shareGroup') {
    groupShare(request.groupSecret, request.secretiv, request.sessionKey, request.sessioniv, request.fileId, request.sharedWith);
  }

});

  port.onDisconnect.addListener(function(port) { 
  
  })

});
