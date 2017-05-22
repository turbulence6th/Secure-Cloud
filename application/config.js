var rsa = forge.pki.rsa;
var pki = forge.pki;
var publicKey;
var privateKey;
var secure_algorithm;
var url;

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

