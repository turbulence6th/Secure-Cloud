function arrayBufferToBase64(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for(var i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
}

function addNewLines(str) {
    var finalString = '';
    while(str.length > 0) {
        finalString += str.substring(0, 64) + '\n';
        str = str.substring(64);
    }

    return finalString;
}

function toPemPub(privateKey) {
    var b64 = addNewLines(btoa(privateKey));
    var pem = "-----BEGIN PUBLIC KEY-----\n" + b64 + "-----END PUBLIC KEY-----";
    console.log("Public Pem: " + pem);
    return pem;
}
function toPemPri(privateKey) {
    var b64 = addNewLines(btoa(privateKey));
    var pem = "-----BEGIN PRIVATE KEY-----\n" + b64 + "-----END PRIVATE KEY-----";
    console.log("Private Pem: " + pem);
    return pem;
}

function removeLines(str) {
	return str.replace("\n", "");
}

function base64ToArrayBuffer(b64) {
    var byteString = window.atob(b64);
    var byteArray = new Uint8Array(byteString.length);
    for(var i=0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    return byteArray;
}

function pemToArrayBufferPri(pem) {
    var b64Lines = removeLines(pem);
    var b64Prefix = b64Lines.replace('-----BEGIN PRIVATE KEY-----', '');
    var b64Final = b64Prefix.replace('-----END PRIVATE KEY-----', '');

    return base64ToArrayBuffer(b64Final);
}

function pemToArrayBufferPub(pem) {
    var b64Lines = removeLines(pem);
    var b64Prefix = b64Lines.replace('-----BEGIN PUBLIC KEY-----', '');
    var b64Final = b64Prefix.replace('-----END PUBLIC KEY-----', '');
    
    return base64ToArrayBuffer(b64Final);
}

function textToBin(text) {
  var length = text.length,
      output = [];
  for (var i = 0;i < length; i++) {
    var bin = text[i].charCodeAt().toString(2);
    output.push(Array(8-bin.length+1).join("0") + bin);
  } 
  return output.join(" ");
}

function downloadPem(data,keyname, type) {
    //data = textToBin(data);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    var blob = new Blob([data], {type: "application/octet-stream"}),
    url = window.URL.createObjectURL(blob);
    a.href = url;
    if (type == "public")
        a.download = "public.pem";
    else if (type == "private")
        a.download = "private.pem";
    else 
        return;
    a.click();
    window.URL.revokeObjectURL(url);
}

