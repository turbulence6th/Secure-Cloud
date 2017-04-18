
/***************************** GENERATE KEY    ***************************/

function generate_key(keyname,algo) {

	// generate rsa keys
	var keyPair;
	createAndSaveAKeyPair(algo).then(function(param) { exportPublicKey(param,keyname,algo);});

}

function createAndSaveAKeyPair(algo) {

	// Side effect: updates keyPair in enclosing scope with new value.
	return window.crypto.subtle.generateKey(
	    {
		name: algo,
		modulusLength: 2048,
		publicExponent: new Uint8Array([1, 0, 1]),  //65537 24 bit gösterimi
		hash: {name: "SHA-256"}
	    },
	    true,   
	    ["encrypt", "decrypt"]).
		then(function (key) {
	    	keyPair = key;
	    	console.log(key);
	    	return key;
		});

}
	
function exportPublicKey(key,keyname,algo) {
	window.crypto.subtle.exportKey(
		"jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
		key.publicKey //can be a publicKey or privateKey, as long as extractable was true
	)
	.then(function(keydata){
		var result = {};
		result.publicKey = keydata;
		result.key = key;
		exportPrivateKey(result,keyname,algo);
	})
	.catch(function(err){
		console.error(err);
	});
	
}

function exportPrivateKey(param,keyname,algo) {
	console.log(param);
	window.crypto.subtle.exportKey(
		"jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
		param.key.privateKey //can be a publicKey or privateKey, as long as extractable was true
	)
	.then(function(keydata){
		var result = {};
		console.log(keydata);
		result.publicKey = JSON.stringify(param.publicKey);
		result.privateKey = JSON.stringify(keydata);
		result.key = param.key;
		// save key in chrome storage
		var object = {};
    	object[keyname] = {"SECURE_CLOUD_KEY_NAME" : keyname, "SECURE_CLOUD_KEY_ALGORITHM" : algo, "SECURE_CLOUD_PRIVATE_KEY" : result.privateKey, "SECURE_CLOUD_PUBLIC_KEY" : result.publicKey };
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

	})
	.catch(function(err){
		console.error(err);
	});
}

/************************ choose key *******************************/
function chooseKey(url, value) {
	chrome.storage.local.get(null,function(items) {
		var allKeys = Object.keys(items);
		for (var i in allKeys) {
			var key = allKeys[i];
			if ( items[key]["SECURE_CLOUD_KEY_NAME"] == value  ) {
	  			owncloudSendPublicKey(items[key]["SECURE_CLOUD_PUBLIC_KEY"]);
	  			addNewRowToMatchUpTable(url,value);
	  			var object = {};
    			object[url] = {"SECURE_CLOUD_KEY_NAME" : value, "SECURE_CLOUD_KEY_URL" : url, "SECURE_CLOUD_MATCHUP": true };
    			chrome.storage.local.set( object , function() {});
	  			$("#choose-key-alert").toggleClass("visible hidden");
	  			$("#choose-key-button").toggleClass("visible hidden");
	  			$(".choose-key-checkbox").toggleClass("visible hidden");
			}
		}
	});
}

function owncloudSendPublicKey(publicKey) {
	portObject.postMessage({
		type: "generateKey",
		key: publicKey
	});
}

/****************************************** import key **************************************/

function import_key(publicKey,privateKey) {
	var b64Lines = removeLines(privateKey);
    var b64Prefix = b64Lines.replace('-----BEGIN RSA PRIVATE KEY-----', '');
    var b64Final = b64Prefix.replace('-----END RSA PRIVATE KEY-----', '');
    var privatekey = atob(b64Final);
    console.log(privatekey);
    /*b64Lines = removeLines(publicKey);
    b64Prefix = b64Lines.replace('-----BEGIN RSA PUBLIC KEY-----', '');
    b64Final = b64Prefix.replace('-----END RSA PUBLIC KEY-----', '');
    var publicKey = atob(b64Final);
	*/
    //var object = {};
    //object["ramoo"] = {"SECURE_CLOUD_KEY_NAME" : "ramoo", "SECURE_CLOUD_KEY_ALGORITHM" : "RSA-OAEP", "SECURE_CLOUD_PRIVATE_KEY" : privateKey, "SECURE_CLOUD_PUBLIC_KEY" : publicKey };
    //chrome.storage.local.set( object , function() {});

}


