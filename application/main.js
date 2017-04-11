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

var portObject ;
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    debugger;
  }
);

chrome.runtime.onConnectExternal.addListener(function(port) {
  portObject = port;
  port.onMessage.addListener(function(request, port) {
    if(request.type == 'login') {
      var hasKey = false;
      chrome.storage.local.get(null,function(items) {
      if ( items[request.url]["SECURE_CLOUD_MATCHUP"] ) {
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


