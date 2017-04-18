function decryptTheFile(file, iv,filename,privateKey,sessionKey,secretKey) {
    // Click handler. Reads the selected file, then decrypts it to
    // the random key pair's private key. Creates a Blob with the result,
  

    var ciphertext      = file;
    var encryptedKey = sessionKey;

    decrypt(ciphertext, iv, encryptedKey, privateKey,secretKey).
    then(function(blob) {
         //return blob;
        var reader = new FileReader();
        reader.onload = function (readerEvt) {
            portObject.postMessage({
                type: "downloadFile",
                data: btoa(readerEvt.target.result),
                fileName : filename
            });
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
        reader.readAsBinaryString(blob);  
    }).
    catch(function(err) {
          console.log("Something went wrong decrypting: " + err.message + "\n" + err.stack);
    });
    
    
    function decrypt(ciphertext, iv, encryptedSessionKey, privateKey,secretKey) {
    // Returns a Promise the yields a Blob containing the decrypted ciphertext.
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
    	var secretIV = "2oGfnx23bDl4BHEbujwm2g==";
    	secretIV = base64ToArrayBuffer(secretIV);
    	return window.crypto.subtle.decrypt(
		    {
		        name: "AES-CBC",
		        iv: secretIV, //The initialization vector you used to encrypt
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
    } // end of decryptTheFile
