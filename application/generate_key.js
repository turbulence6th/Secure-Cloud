
/***************************** GENERATE KEY    ***************************/

function generate_key(keyname) {
	rsa.generateKeyPair({bits: 2048, workers: 2}, function(err, keypair) {
  		var privateKey = keypair.privateKey;
  		var publicKey = keypair.publicKey;
  		// convert a Forge private key to PEM-format
  		var privatePem = pki.privateKeyToPem(privateKey);
  		var object = {};
    	object[keyname] = {"SECURE_CLOUD_KEY_NAME" : keyname, "SECURE_CLOUD_PEM_FILE" : privatePem };
    	chrome.storage.local.set( object , function() {});
    	// add it to table
    	var item = object[keyname];
    	addNewRowToUserKeysTable(item, "userkeys");
    	//setKeys();
		$(".tabpanel").removeClass("visible");
		$(".tabpanel").addClass("hidden");
		$("#displayKeys").toggleClass("hidden visible");
		$(".list-group-item").removeClass("active");
		$(".list-group-item[data-tab-name='displayKeys']").addClass("active"); 
  	});
}


/************************ choose key *******************************/
function chooseKey(url, value) {
	chrome.storage.local.get(null,function(items) {
		var allKeys = Object.keys(items);
		for (var i in allKeys) {
			var key = allKeys[i];
			if ( items[key]["SECURE_CLOUD_KEY_NAME"] == value  ) {
				var pem = items[key]["SECURE_CLOUD_PEM_FILE"];
				console.log(pem);
				var private = pki.privateKeyFromPem(pem);
  				var public = forge.pki.setRsaPublicKey(private.n, private.e);
  				var publicpem = pki.publicKeyToPem(public);
	  			owncloudSendPublicPem(publicpem);
	  			addNewRowToMatchUpTable(url,value);
	  			var object = {};
    			object[url] = {"SECURE_CLOUD_KEY_NAME" : value, "SECURE_CLOUD_KEY_URL" : url, "SECURE_CLOUD_MATCHUP": true };
    			chrome.storage.local.set( object , function() {});
	  			$("#choose-key-alert").toggleClass("visible hidden");
	  			$("#choose-key-button").toggleClass("visible hidden");
	  			$("#use-smartcard-button").toggleClass("visible hidden")
	  			$(".choose-key-checkbox").toggleClass("visible hidden");
			}
		}
	});
}

function owncloudSendPublicPem(publicpem) {
	portObject.postMessage({
		type: "generateKey",
		key: publicpem
	});
}

/****************************************** import key **************************************/


function import_key(pemname, privatepem) {
	console.log("importing ...");
	
	var object = {};
	object[pemname] = {"SECURE_CLOUD_KEY_NAME" : pemname,  "SECURE_CLOUD_PEM_FILE" : privatepem };
	chrome.storage.local.set( object , function() {});
	var item = object[pemname];
	addNewRowToUserKeysTable(item, "userkeys");
	$("#privateKey").val("");
	$("#pem-name").val("");
	$(".tabpanel").removeClass("visible");
	$(".tabpanel").addClass("hidden");
	$("#displayKeys").toggleClass("hidden visible");
	$(".list-group-item").removeClass("active");
	$(".list-group-item[data-tab-name='displayKeys']").addClass("active"); 

}

/************************ use smartcard *************************/
function useSmartcard(url) {

	var publickey = getPublicKeyFromSmartCard();
	owncloudSendPublicKey(publickey);
	addNewRowToMatchUpTable(url,'SECURE_CLOUD_SMARTCARD');
	var object = {};
	object[url] = {"SECURE_CLOUD_KEY_NAME" : 'SECURE_CLOUD_SMARTCARD', "SECURE_CLOUD_KEY_URL" : url, "SECURE_CLOUD_MATCHUP": true };
	chrome.storage.local.set( object , function() {});
	$("#choose-key-alert").toggleClass("visible hidden");
	$("#choose-key-button").toggleClass("visible hidden");
	$("#use-smartcard-button").toggleClass("visible hidden");
	$(".choose-key-checkbox").toggleClass("visible hidden");
	
}

function getPublicKeyFromSmartCard() {
	
}
