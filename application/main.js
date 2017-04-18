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

var portObject;
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    debugger;
  }
);

chrome.runtime.onConnectExternal.addListener(function(port) {
  portObject = port;
  port.onMessage.addListener(function(request, port) {
    if(request.type == "uploadFile") {
      var file = new File([window.atob(request.file)], request.fileName);
      uploadFile(file);
    }

    else if(request.type == "downloadFile") {
      var file = base64ToArrayBuffer(request.file);
      var iv = base64ToArrayBuffer(request.iv);
      var sessionKey = base64ToArrayBuffer(request.sessionKey);
      var secretKey = request.secretKey;
      var filename = request.fileName;

      console.log(request.file);

      decryptTheFile(file, iv, filename, privateKey, sessionKey, secretKey);
    }

    else if(request.type == "shareFile") {
      var userPublicKey = JSON.parse(request.publicKey);
      var sessionKey = base64ToArrayBuffer(request.sessionKey);
      var iv = request.iv;
      var fileId = request.fileId;
      var sharedWith = request.sharedWith;
      importPublicKey(userPublicKey, sessionKey, iv, fileId, sharedWith).
      then(decryptSessionKey).
      then(encryptSessionKey).
      then(postShareFile);
    }
    else if(request.type == 'login') {
      var hasKey = false;
      chrome.storage.local.get(null,function(items) {
      if (items[request.url] && items[request.url]["SECURE_CLOUD_MATCHUP"] ) {
        hasKey = true;
      }
      console.log("Key found status: " + hasKey);
      if (hasKey == false) {
        $("#choose-key-alert").toggleClass("hidden visible");
        $(".choose-key-checkbox").toggleClass("hidden visible");
        $("#choose-key-button").toggleClass("hidden visible");
        $("#choose-key-button").val(request.url);
      } else {
        setKeys(items[request.url]["SECURE_CLOUD_KEY_NAME"]);
      }
      
    });
  }

  else if(request.type == 'createCryptoGroup') {
    createCryptoGroup(request.groupname);
  }

  else if(request.type == 'addMember') {
    username = request.member;
    groupname = request.groupname;

    var encryptedSecret = base64ToArrayBuffer(request.secretKey);
    var userPublicKey = JSON.parse(request.publicKey);
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
    then(function(data2) {
      userPublicKey = data2; return decryptKey(encryptedSecret,privateKey)}).
    then(function(data3) {
      return encryptUserSessionKey(data3,userPublicKey)}).
    then(AddNewMemberToGroupRequest);
  }

  else if(request.type == 'shareGroup') {
    var encryptedSecret = base64ToArrayBuffer(request.groupSecret);
    var sessionKey = base64ToArrayBuffer(request.sessionKey);

    fileId = request.fileId;
    groupname = request.groupname;

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

chrome.storage.local.get(null,function(items) {
  var allKeys = Object.keys(items);
  for (var i in allKeys) {
    var key = allKeys[i];
    if (items[key]["SECURE_CLOUD_MATCHUP"]) {
      addNewRowToMatchUpTable(items[key]["SECURE_CLOUD_KEY_URL"],items[key]["SECURE_CLOUD_KEY_NAME"]);
    } 
    else if ( items[key]["SECURE_CLOUD_KEY_NAME"]  ) {
      addNewRowToUserKeysTable(items[key], "userkeys");
    }
  }
});



function addNewRowToUserKeysTable(item,tablename) {
  var visibility = "hidden";
  var check = $("#choose-key-alert").hasClass("visible");
  if (check)
    visibility = "visible";
  var row = "<tr>";
  row += "<td><input type='radio' name='choose-key'  class='choose-key-checkbox "+ visibility +"' value='"+ item["SECURE_CLOUD_KEY_NAME"]  +"'/></td>";
  row += "<td>" + item["SECURE_CLOUD_KEY_NAME"] + "</td>";
  row += "<td>"+ item["SECURE_CLOUD_KEY_ALGORITHM"] +"</td>";
  row += "<td><button class='btn btn-xs btn-danger'><span class='glyphicon glyphicon-trash'></span></button></td>";
  row += "</tr>";
  $("#userkeys > tbody").append(row);
}

function addNewRowToMatchUpTable(url,value) {
  var row = "<tr>";
  row += "<td>" + url + "</td>";
  row += "<td>"+ value +"</td>";
  row += "</tr>";
  $("#matchups > tbody").append(row);
}


$('.list-group-item').click(function(){
    var tabname = $(this).data("tab-name");
    $(".tabpanel").removeClass("visible");
    $(".tabpanel").addClass("hidden");
    $("#"+tabname).toggleClass("hidden visible");
    $(".list-group-item").removeClass("active");
    $(this).addClass("active"); 
});


