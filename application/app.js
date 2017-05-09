$( document ).ready(function() {
    $('.list-group-item').click(function(){
		var tabname = $(this).data("tab-name");
		$(".tabpanel").removeClass("visible");
		$(".tabpanel").addClass("hidden");
		$("#"+tabname).toggleClass("hidden visible");
		$(".list-group-item").removeClass("active");
		$(this).addClass("active"); 
	});

	$("#goImport").click( function() {
		$(".tabpanel").removeClass("visible");
		$(".tabpanel").addClass("hidden");
		$("#importKeys").toggleClass("hidden visible");
		$(".list-group-item").removeClass("active");
		$("a[data-tab-name='importKeys']").addClass("active"); 
	});	

	$("#goGenerate").click( function() {
		$(".tabpanel").removeClass("visible");
		$(".tabpanel").addClass("hidden");
		$("#generateKeys").toggleClass("hidden visible");
		$(".list-group-item").removeClass("active");
		$("a[data-tab-name='generateKeys']").addClass("active"); 
	});	

	$("#clear-textarea").click( function() {
		$("textarea").val("");
	});
	$("#clear-input").click( function() {
		$("input").val("");
	});
	$("#choose-key-button").click(function() {
		var value = $("input[type='radio'][name='choose-key']:checked").val();
		var url = $(this).val();
		console.log("Chosen key: " + value);
		chooseKey(url, value);
	});

  $("#use-smartcard-button").click(function() {
    var url = $(this).val();
    console.log("Smartcard will be used for: " + url);
    useSmartcard(url);
  });

	$("#import-key").click( function() {
		var pemname = $("#pem-name").val();
		var privatepem = $("#privateKey").val();
		import_key(pemname,privatepem);
	});

	$("#generate-key").click( function() {
		var keyname = $("#keyname").val();
		var algo = $("#algo").val();
		generate_key(keyname,algo);

	});

	$("body").on('click', '.downloadPublicPem' ,function(){
    var keyname = $(this).data("keyname");
    console.log("keyname: " + keyname);
    chrome.storage.local.get(null,function(items) {
        if (items[keyname] && items[keyname]["SECURE_CLOUD_KEY_NAME"] == keyname ) {
          var crypt = new OpenCrypto();
          return window.crypto.subtle.importKey(
            "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
            JSON.parse(items[keyname]["SECURE_CLOUD_PUBLIC_KEY"]),
            {   //these are the algorithm options
              name: "RSA-OAEP",
              hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
            },
            true, //whether the key is extractable (i.e. can be used in exportKey)
            ["encrypt"] //"encrypt" or "wrapKey" for public key import or
              //"decrypt" or "unwrapKey" for private key imports
          ).then( function(publickey) {
              crypt.cryptoPublicToPem(publickey).then(function(publicPem) {
                downloadPem(publicPem,keyname,"public");
              });
          });
          
        }
      });
  });
  $("body").on('click', '.downloadPrivatePem' ,function(){
    var keyname = $(this).data("keyname");
    console.log("keyname: " + keyname);
    chrome.storage.local.get(null,function(items) {
        if (items[keyname] && items[keyname]["SECURE_CLOUD_KEY_NAME"] == keyname ) {
          var crypt = new OpenCrypto();
          return window.crypto.subtle.importKey(
            "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
            JSON.parse(items[keyname]["SECURE_CLOUD_PRIVATE_KEY"]),
            {   //these are the algorithm options
              name: "RSA-OAEP",
              hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
            },
            true, //whether the key is extractable (i.e. can be used in exportKey)
            ["decrypt"] //"encrypt" or "wrapKey" for public key import or
              //"decrypt" or "unwrapKey" for private key imports
          ).then( function(privatekey) {
              crypt.cryptoPrivateToPem(privatekey).then(function(privatePem) {
                downloadPem(privatePem,keyname,"private");
              });
          });
          
        }
      });
  });

	

});



