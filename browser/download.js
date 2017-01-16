

// download file function
function downloadFile(fileId) {
	$.ajax({	
		url : url + '/owncloud/index.php/apps/endtoend/downloadFile',
		data :  {
			fileId : fileId
		},
		//dataType : 'json',
		type : 'GET',
		success : function(data) {

			var file = new Blob([base64ToArrayBuffer(data.file)], {type: "application/octet-stream"});
			var sessionKey = base64ToArrayBuffer(data.sessionKey);
            var secretKey = data.secretKey;
			var filename = data.fileName;
			decryptTheFile(file,filename,privateKey,sessionKey,secretKey);
			


		},
		async : true
	});	
}

// save blob data to local disk
function saveData(data, fileName) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    var blob = new Blob([data], {type: "application/octet-stream"}),
    url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
 }


function decryptTheFile(file,filename,privateKey,sessionKey,secretKey) {
    // Click handler. Reads the selected file, then decrypts it to
    // the random key pair's private key. Creates a Blob with the result,
  
  	file = new File([file], "deneme", {type: "application/octet-stream" });
    var sourceFile = file; 
    
    var reader = new FileReader();
    reader.onload = processTheFile;
    reader.readAsArrayBuffer(sourceFile);

    function processTheFile() {
    // Load handler for file reader. Needs to reference keyPair from
    // enclosing scope.
    var reader = this;              // Invoked by the reader object
    var data = reader.result;

    // First, separate out the relevant pieces from the file.
    var keyLength       = new Uint16Array(data, 0, 2)[0];   // First 16 bit integer
    var encryptedKey    = new Uint8Array( data, 2,              keyLength);
    var iv              = new Uint8Array( data, 2 + keyLength,  16);
    var ciphertext      = new Uint8Array( data, 2 + keyLength + 16);
    var encryptedKey = sessionKey;

    decrypt(ciphertext, iv, encryptedKey, privateKey,secretKey).
    then(function(blob) {
         //return blob;
         saveData(blob,filename);
         
         }).
    catch(function(err) {
          alert("Something went wrong decrypting: " + err.message + "\n" + err.stack);
          });
    
    
    function decrypt(ciphertext, iv, encryptedSessionKey, privateKey,secretKey) {
    // Returns a Promise the yields a Blob containing the decrypted ciphertext.
    console.log("decrypt");
    if (secretKey) {
        secretKey = base64ToArrayBuffer(secretKey);
        return decryptKey(secretKey,privateKey).
            then(importSessionKey).
            then(function(groupSecret) {return aesDecrypt(encryptedSessionKey, groupSecret);}).
            then(importSessionKey).
            then(decryptCiphertext);
    } else {   
        return decryptKey(encryptedSessionKey, privateKey).
        then(importSessionKey).
        then(decryptCiphertext);
    }
    
    
    function aesDecrypt(encryptedKey, aesKey) {
    	return window.crypto.subtle.decrypt(
		    {
		        name: "AES-CBC",
		        iv: iv, //The initialization vector you used to encrypt
		    },
		    aesKey, //from generateKey or importKey above
		    encryptedKey //ArrayBuffer of the data
		);
    }

    function decryptKey(encryptedKey, privateKey) {
        // Returns a Promise that yields a Uint8Array AES key.
        // encryptedKey is a Uint8Array, privateKey is the privateKey
        // property of a Key key pair.
        return window.crypto.subtle.decrypt({name: "RSA-OAEP"}, privateKey, encryptedKey);
    }
    
    
    function importSessionKey(keyBytes) {
    // Returns a Promise yielding an AES-CBC Key from the
    // Uint8Array of bytes it is given.
    
    return window.crypto.subtle.importKey(
                                          "raw",
                                          keyBytes,
                                          {name: "AES-CBC", length: 128},
                                          true,
                                          ["encrypt", "decrypt"]
                                          );
    }
    
    function decryptCiphertext(sessionKey) {
    // Returns a Promise yielding a Blob containing the decryption of ciphertext
    // (from an enclosing scope) using the sessionKey and the iv
    // (initialization vector, from an enclosing scope).
    return window.crypto.subtle.decrypt({name: "AES-CBC", iv: iv}, sessionKey, ciphertext).
    then(function(plaintext) {
         return new Blob([new Uint8Array(plaintext)], {type: "application/octet-stream"});
         });
    }
    
    } // end of decrypt
    } // end of processTheFile
    } // end of decryptTheFile


// bind the downloadFile button to download function
document.getElementById("downloadFile").addEventListener("click",function() {downloadFile(fileId)});
