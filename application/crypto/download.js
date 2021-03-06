function decryptTheFile(ciphertext, sessioniv, secretiv, filename ,sessionKey,secretKey) {
    // Click handler. Reads the selected file, then decrypts it to
    // the random key pair's private key. Creates a Blob with the result,
    var iv = decodeURIComponent(escape(atob(sessioniv)));
    var encrypted = forge.util.decode64(ciphertext);
    var input = forge.util.createBuffer(encrypted);
    if (secretKey) {
        sessionKey = decodeURIComponent(escape(atob(sessionKey)));
        secretKey = decodeURIComponent(escape(atob(secretKey)));
        secretiv = decodeURIComponent(escape(atob(secretiv)));
        secretKey = privateKey.decrypt(secretKey, 'RSA-OAEP');
        var decipher = forge.cipher.createDecipher('AES-CBC', secretKey);
        decipher.start({iv: secretiv});
        decipher.update(forge.util.createBuffer(sessionKey));
        decipher.finish();
        sessionKey = decipher.output.getBytes();

        var decipher2 = forge.cipher.createDecipher('AES-CBC', sessionKey);
        decipher2.start({iv: iv});
        decipher2.update(input);
        decipher2.finish();
        // outputs decrypted hex
        var decrypted64 = decipher2.output.getBytes();
    } else {   
        sessionKey = decodeURIComponent(escape(atob(sessionKey)));
        sessionKey = privateKey.decrypt(sessionKey, 'RSA-OAEP'); 
        var decipher = forge.cipher.createDecipher('AES-CBC', sessionKey);
        decipher.start({iv: iv});
        decipher.update(input);
        decipher.finish();
        // outputs decrypted hex
        var decrypted64 = decipher.output.getBytes();
    }  
    portObject.postMessage({
        type: "downloadFile",
        data: decrypted64,
        fileName : filename
    });
 

} // end of decryptTheFile
