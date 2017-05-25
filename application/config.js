var rsa = forge.pki.rsa;
var pki = forge.pki;


var publicKey;
var privateKey;
var secure_key_names = [];

chrome.storage.local.get(null,function(items) {
	var allKeys = Object.keys(items);
	for (var i = 0; i < allKeys.length; i++) {
    	var key = allKeys[i];
		secure_key_names.push(items[key]["SECURE_CLOUD_KEY_NAME"]);    	
	}
});

function setKeys(keyname) {
	console.log("Setting Keys: " + keyname);
	chrome.storage.local.get(null,function(items) {
		var pem = items[keyname]["SECURE_CLOUD_PEM_FILE"];
		secure_algorithm = items[keyname]['SECURE_CLOUD_ALGORITHM'] != undefined ? items[keyname]['SECURE_CLOUD_ALGORITHM'] : 'RSA-OAEP';
		privateKey = pki.privateKeyFromPem(pem);
		publicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e);
	});
}

function setKeysFromSmartCard() {
	
}

