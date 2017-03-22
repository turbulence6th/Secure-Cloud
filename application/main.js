chrome.app.runtime.onLaunched.addListener(function() {
  // Center window on screen.
  var screenWidth = screen.availWidth;
  var screenHeight = screen.availHeight;
  var width = 500;
  var height = 300;

  chrome.app.window.create('index.html', {
    id: "Secure Cloud",
    outerBounds: {
      width: width,
      height: height,
      left: Math.round((screenWidth-width)/2),
      top: Math.round((screenHeight-height)/2)
    }
  });
});

var portObject ;
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    debugger;
  }
);

chrome.runtime.onConnectExternal.addListener(function(port) {
  portObject = port;
  port.onMessage.addListener(function(request, port) {
    if(request.type == 'generateKey') {
      if(request.success) {
        
      }
    }
  });

  port.onDisconnect.addListener(function(port) {
   
  })
});

chrome.storage.local.get(null,function(items) {
  var allKeys = Object.keys(items);
  for (var i in allKeys) {
    var key = allKeys[i];
    if ( items[key]["SECURE_CLOUD_KEY_NAME"]  ) {
      var row = "<tr>";
      row += "<td><input type='radio' data-key-name='"+ items[key]["SECURE_CLOUD_KEY_NAME"] +"'></input></td>";
      row += "<td>" + items[key]["SECURE_CLOUD_KEY_NAME"] + "</td>";
      row += "<td>"+ items[key]["SECURE_CLOUD_KEY_PATH"] +"</td>";
      row += "<td>"+ items[key]["SECURE_CLOUD_KEY_ALGORITHM"] +"</td>";
      row += "<td><button class='btn btn-xs btn-danger'><span class='glyphicon glyphicon-trash'></span></button></td>";
      row += "</tr>";
      $("tbody").append(row);
    }
  }

});

         