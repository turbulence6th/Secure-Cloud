function decryptTheFile(ciphertext, iv,filename,privateKey,sessionKey,secretKey) {
    // Click handler. Reads the selected file, then decrypts it to
    // the random key pair's private key. Creates a Blob with the result,
  
    var data;

    encrypted = forge.util.decode64(ciphertext);

    if (secretKey) {
        secretKey = atob(secretKey);
        secretKey = privateKey.decrypt(secretKey, 'RSA-OAEP');
        
            /*then(function(groupSecret) {return aesDecrypt(encryptedSessionKey, groupSecret);}).
            then(importSessionKey).
            then(decryptCiphertext);*/
    } else {   
        input = forge.util.createBuffer(encrypted);
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
