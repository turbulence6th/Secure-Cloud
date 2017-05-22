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
        var privatepem = items[keyname]["SECURE_CLOUD_PEM_FILE"];
        var private = pki.privateKeyFromPem(privatepem);
        var public = forge.pki.setRsaPublicKey(private.n, private.e);
        var publicpem = pki.publicKeyToPem(public);
        downloadPem(publicpem,keyname,"public");
      }
    });
  });

  $("body").on('click', '.downloadPrivatePem' ,function(){
    var keyname = $(this).data("keyname");
    console.log("keyname: " + keyname);
    chrome.storage.local.get(null,function(items) {
      if (items[keyname] && items[keyname]["SECURE_CLOUD_KEY_NAME"] == keyname ) {
        var privatepem = items[keyname]["SECURE_CLOUD_PEM_FILE"];
        downloadPem(privatepem,keyname,"private");
      }
    });
  });

	

});



