/**
 *
 * Copyright (c) 2016 Peter Bielak
 * Cryptography Consultancy by Andrew Kozlik, Ph.D.
 *
 * OpenCrypto is a library written on top of WebCrypto API that allows
 * you to quickly and effectively use cryptographic functions that
 * are built-in natively in the browser.
 */

/**
 * MIT License
 *
 * Copyright (c) 2016 Peter Bielak
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 * to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';
var cryptoApi = window.crypto.subtle || window.crypto.webkitSubtle;
var securePRNG = window.crypto;
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var lookup = new Uint8Array(256);

/**
 * OpenCrypto constructor function
 */
var OpenCrypto = function() {
    initB64();
};

function initB64() {
    for (var i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }
}

/**
 * base64-arraybuffer
 * GitHub @niklasvh
 * Copyright (c) 2012 Niklas von Hertzen
 * MIT License
 */

function encodeAb(arrayBuffer) {
    var bytes = new Uint8Array(arrayBuffer),
    i, len = bytes.length, base64 = '';

    for (i = 0; i < len; i+=3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }

    return base64;
}

function decodeAb(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }

    var arrayBuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arrayBuffer);

    for (i = 0; i < len; i+=4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i+1)];
        encoded3 = lookup[base64.charCodeAt(i+2)];
        encoded4 = lookup[base64.charCodeAt(i+3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arrayBuffer;
}

function addNewLines(str) {
    var finalString = '';
    while (str.length > 0) {
        finalString += str.substring(0, 64) + '\r\n';
        str = str.substring(64);
    }

    return finalString;
}

function removeLines(str) {
    return str.replace(/\r?\n|\r/g, '');
}

function d2h(d) {
    var h = null;
    if (typeof d === 'number') {
        h = (d).toString(16)
    } else if (typeof d === 'string') {
        h = (d.length / 2).toString(16)
    }

    return h.length % 2 ? '0' + h : h;
}

function toAsn1(wrappedKey, salt, iv, iterations, hash, cipher, keyLength, self) {
    var opt = {};
    wrappedKey = self.arrayBufferToHexString(wrappedKey);
    salt = self.arrayBufferToHexString(salt);
    iv = self.arrayBufferToHexString(iv);
    iterations = d2h(iterations);

    var PBES2_OID = '06092a864886f70d01050d';
    var PBKDF2_OID = '06092a864886f70d01050c';

    var AES256GCM_OID = '060960864801650304012e';
    var AES192GCM_OID = '060960864801650304011a';
    var AES128GCM_OID = '0609608648016503040106';

    var AES256CBC_OID = '060960864801650304012a';
    var AES192CBC_OID = '0609608648016503040116';
    var AES128CBC_OID = '0609608648016503040102';

    var AES256CFB_OID = '060960864801650304012c';
    var AES192CFB_OID = '0609608648016503040118';
    var AES128CFB_OID = '06086086480165030404';

    var SHA512_OID = '06082a864886f70d020b0500';
    var SHA384_OID = '06082a864886f70d020a0500';
    var SHA256_OID = '06082a864886f70d02090500';
    var SHA1_OID = '06082a864886f70d02070500';

    var ITER_INTEGER = '02' + d2h(iterations.length / 2) + iterations;
    var LENGTH_INTEGER = '02' + d2h(keyLength.length / 2) + keyLength;

    var KEY_OCTET = '0482' + d2h(wrappedKey) + wrappedKey;
    var SALT_OCTET = '04' + d2h(salt) + salt;
    var IV_OCTET = '04' + d2h(iv) + iv;

    switch (cipher) {
        case 'AES-GCM' :
            if (keyLength == 256) {
                opt.CIPHER_OID = AES256GCM_OID;
            } else if (keyLength == 192) {
                opt.CIPHER_OID = AES192GCM_OID;
            } else if (keyLength == 128) {
                opt.CIPHER_OID = AES128GCM_OID;
            }
            break;
        case 'AES-CBC' :
            if (keyLength == 256) {
                opt.CIPHER_OID = AES256CBC_OID;
            } else if (keyLength == 192) {
                opt.CIPHER_OID = AES192CBC_OID;
            } else if (keyLength == 128) {
                opt.CIPHER_OID = AES128CBC_OID;
            }
            break;
        case 'AES-CFB' :
            if (keyLength == 256) {
                opt.CIPHER_OID = AES256CFB_OID;
            } else if (keyLength == 192) {
                opt.CIPHER_OID = AES192CFB_OID;
            } else if (keyLength == 128) {
                opt.CIPHER_OID = AES128CFB_OID;
            }
            break;
    }

    switch (hash) {
        case 'SHA-512' :
            opt.HASH_OID = SHA512_OID;
            break;
        case 'SHA-384' :
            opt.HASH_OID = SHA384_OID;
            break;
        case 'SHA-256' :
            opt.HASH_OID = SHA256_OID;
            break;
        case 'SHA-1' :
            opt.HASH_OID = SHA1_OID;
    }

    opt.SEQUENCE_AES_CONTAINER = '30' + d2h(opt.CIPHER_OID + IV_OCTET);
    opt.SEQUENCE_HASH_CONTAINER = '30' + d2h(opt.HASH_OID);
    opt.SEQUENCE_PBKDF2_INNER_CONTAINER = '30' + d2h(SALT_OCTET + ITER_INTEGER + opt.SEQUENCE_HASH_CONTAINER + opt.HASH_OID);
    opt.SEQUENCE_PBKDF2_CONTAINER = '30' + d2h(PBKDF2_OID + opt.SEQUENCE_PBKDF2_INNER_CONTAINER + SALT_OCTET + ITER_INTEGER + opt.SEQUENCE_HASH_CONTAINER + opt.HASH_OID);
    opt.SEQUENCE_PBES2_INNER_CONTAINER = '30' + d2h(opt.SEQUENCE_PBKDF2_CONTAINER + PBKDF2_OID + opt.SEQUENCE_PBKDF2_INNER_CONTAINER + SALT_OCTET + ITER_INTEGER + opt.SEQUENCE_HASH_CONTAINER + opt.HASH_OID + opt.SEQUENCE_AES_CONTAINER + opt.CIPHER_OID + IV_OCTET);
    opt.SEQUENCE_PBES2_CONTAINER = '30' + d2h(PBES2_OID + opt.SEQUENCE_PBES2_INNER_CONTAINER + opt.SEQUENCE_PBKDF2_CONTAINER + PBKDF2_OID + opt.SEQUENCE_PBKDF2_INNER_CONTAINER + SALT_OCTET + ITER_INTEGER + opt.SEQUENCE_HASH_CONTAINER + opt.HASH_OID + opt.SEQUENCE_AES_CONTAINER + opt.CIPHER_OID + IV_OCTET);

    var SEQUENCE_PARAMETERS = opt.SEQUENCE_PBES2_CONTAINER + PBES2_OID + opt.SEQUENCE_PBES2_INNER_CONTAINER + opt.SEQUENCE_PBKDF2_CONTAINER + PBKDF2_OID + opt.SEQUENCE_PBKDF2_INNER_CONTAINER + SALT_OCTET + ITER_INTEGER + opt.SEQUENCE_HASH_CONTAINER + opt.HASH_OID + opt.SEQUENCE_AES_CONTAINER + opt.CIPHER_OID + IV_OCTET;
    var SEQUENCE_LENGTH = d2h(SEQUENCE_PARAMETERS + KEY_OCTET);
    var SEQUENCE = '3082' + SEQUENCE_LENGTH + SEQUENCE_PARAMETERS + KEY_OCTET;

    var asnKey = self.hexStringToArrayBuffer(SEQUENCE);
    var pemKey = self.arrayBufferToBase64(asnKey);
    pemKey = addNewLines(pemKey);
    pemKey = '-----BEGIN ENCRYPTED PRIVATE KEY-----\r\n' + pemKey + '-----END ENCRYPTED PRIVATE KEY-----';

    return pemKey;
}

function fromAsn1(pem, crypt) {
    var opt = {};
    pem = removeLines(pem);
    pem = pem.replace('-----BEGIN ENCRYPTED PRIVATE KEY-----', '');
    pem = pem.replace('-----END ENCRYPTED PRIVATE KEY-----', '');
    pem = crypt.base64ToArrayBuffer(pem);

    var hex = crypt.arrayBufferToHexString(pem);
    opt.data = hex;

    var PBES2_OID = '06092a864886f70d01050d';
    var PBKDF2_OID = '06092a864886f70d01050c';

    var AES256GCM_OID = '060960864801650304012e';
    var AES192GCM_OID = '060960864801650304011a';
    var AES128GCM_OID = '0609608648016503040106';

    var AES256CBC_OID = '060960864801650304012a';
    var AES192CBC_OID = '0609608648016503040116';
    var AES128CBC_OID = '0609608648016503040102';

    var AES256CFB_OID = '060960864801650304012c';
    var AES192CFB_OID = '0609608648016503040118';
    var AES128CFB_OID = '06086086480165030404';

    var SHA512_OID = '06082a864886f70d020b';
    var SHA384_OID = '06082a864886f70d020a';
    var SHA256_OID = '06082a864886f70d0209';
    var SHA1_OID = '06082a864886f70d0207';

    if (opt.data.includes(PBES2_OID) && opt.data.includes(PBKDF2_OID)) {
        opt.valid = true;
    }

    opt.saltBegin = opt.data.indexOf(PBKDF2_OID) + 28;

    if (opt.data.includes(AES256GCM_OID)) {
        opt.cipher = 'AES-GCM';
        opt.keyLength = 256;
        opt.ivBegin = opt.data.indexOf(AES256GCM_OID) + 24;
    } else if (opt.data.includes(AES192GCM_OID)) {
        opt.cipher = 'AES-GCM';
        opt.keyLength = 192;
        opt.ivBegin = opt.data.indexOf(AES192GCM_OID) + 24;
    } else if (opt.data.includes(AES128GCM_OID)) {
        opt.cipher = 'AES-GCM';
        opt.keyLength = 128;
        opt.ivBegin = opt.data.indexOf(AES128GCM_OID) + 24;
    } else if (opt.data.includes(AES256CBC_OID)) {
        opt.cipher = 'AES-CBC';
        opt.keyLength = 256;
        opt.ivBegin = opt.data.indexOf(AES256CBC_OID) + 24;
    } else if (opt.data.includes(AES192CBC_OID)) {
        opt.cipher = 'AES-CBC';
        opt.keyLength = 192;
        opt.ivBegin = opt.data.indexOf(AES192CBC_OID) + 24;
    } else if (opt.data.includes(AES128CBC_OID)) {
        opt.cipher = 'AES-CBC';
        opt.keyLength = 128;
        opt.ivBegin = opt.data.indexOf(AES128CBC_OID) + 24;
    } else if (opt.data.includes(AES256CFB_OID)) {
        opt.cipher = 'AES-CFB';
        opt.keyLength = 256;
        opt.ivBegin = opt.data.indexOf(AES256CFB_OID) + 24;
    } else if (opt.data.includes(AES192CFB_OID)) {
        opt.cipher = 'AES-CFB';
        opt.keyLength = 192;
        opt.ivBegin = opt.data.indexOf(AES192CFB_OID) + 24;
    } else if (opt.data.includes(AES128CFB_OID)) {
        opt.cipher = 'AES-CFB';
        opt.keyLength = 128;
        opt.ivBegin = opt.data.indexOf(AES128CFB_OID) + 22;
    }

    if (opt.data.includes(SHA512_OID)) {
        opt.hash = 'SHA-512';
    } else if (opt.data.includes(SHA384_OID)) {
        opt.hash = 'SHA-384';
    } else if (opt.data.includes(SHA256_OID)) {
        opt.hash = 'SHA-256';
    } else if (opt.data.includes(SHA1_OID)) {
        opt.hash = 'SHA-1';
    }

    opt.saltLength = parseInt(opt.data.substr(opt.saltBegin, 2), 16);
    opt.ivLength = parseInt(opt.data.substr(opt.ivBegin, 2), 16);

    opt.salt = opt.data.substr(opt.saltBegin + 2, opt.saltLength * 2);
    opt.iv = opt.data.substr(opt.ivBegin + 2, opt.ivLength * 2);

    opt.iterBegin = opt.saltBegin + 4 + (opt.saltLength * 2);
    opt.iterLength = parseInt(opt.data.substr(opt.iterBegin, 2), 16);
    opt.iter = parseInt(opt.data.substr(opt.iterBegin + 2, opt.iterLength * 2), 16);

    opt.sequenceLength = parseInt(opt.data.substr(10, 2), 16);
    opt.encryptedDataBegin = 16 + (opt.sequenceLength * 2);
    opt.encryptedDataLength = parseInt(opt.data.substr(opt.encryptedDataBegin, 4), 16);
    opt.encryptedData = opt.data.substr(opt.encryptedDataBegin + 4, (opt.encryptedDataLength * 2));

    var res = {
        salt: crypt.hexStringToArrayBuffer(opt.salt),
        iv: crypt.hexStringToArrayBuffer(opt.iv),
        cipher: opt.cipher,
        keyLength: opt.keyLength,
        hash: opt.hash,
        iter: opt.iter,
        encryptedData: crypt.hexStringToArrayBuffer(opt.encryptedData)
    };

    return res;
}

/**
 *
 * Utility methods for OpenCrypto lib operations
 */
OpenCrypto.prototype.arrayBufferToString = function(arrayBuffer) {
    if (typeof arrayBuffer !== 'object') {
        throw new TypeError('Expected input to be an ArrayBuffer Object');
    }

    var decoder = new TextDecoder('utf-8');
    return decoder.decode(arrayBuffer);
};

OpenCrypto.prototype.stringToArrayBuffer = function(str) {
    if (typeof str !== 'string') {
        throw new TypeError('Expected input to be a String');
    }

    var encoder = new TextEncoder('utf-8');
    var byteArray = encoder.encode(str);
    return byteArray.buffer;
};

OpenCrypto.prototype.arrayBufferToHexString = function(arrayBuffer) {
    if (typeof arrayBuffer !== 'object') {
        throw new TypeError('Expected input to be an ArrayBuffer Object');
    }

    var byteArray = new Uint8Array(arrayBuffer);
    var hexString = '';
    var nextHexByte;

    for (var i = 0; i < byteArray.byteLength; i++) {
        nextHexByte = byteArray[i].toString(16);
        if (nextHexByte.length < 2) {
            nextHexByte = '0' + nextHexByte;
        }
        hexString += nextHexByte;
    }

    return hexString;
};

OpenCrypto.prototype.hexStringToArrayBuffer = function(hexString) {
    if (typeof hexString !== 'string') {
        throw new TypeError('Expected input of hexString to be a String');
    }

    if ((hexString.length % 2) !== 0) {
        throw new RangeError('Expected string to be an even number of characters');
    }

    var byteArray = new Uint8Array(hexString.length / 2);
    for (var i = 0; i < hexString.length; i += 2) {
        byteArray[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
    }

    return byteArray.buffer;
};

OpenCrypto.prototype.arrayBufferToBase64 = function(arrayBuffer) {
    if (typeof arrayBuffer !== 'object') {
        throw new TypeError('Expected input to be an ArrayBuffer Object');
    }

    return encodeAb(arrayBuffer);
};

OpenCrypto.prototype.base64ToArrayBuffer = function(b64) {
    if (typeof b64 !== 'string') {
        throw new TypeError('Expected input to be a base64 String');
    }

    return decodeAb(b64);
};

/**
 *
 * Method for generating asymmetric RSA-OAEP keypair
 * - bits        {Integer}  default: "2048" 2048 bits key pair
 * - usage       {Array}    default: "['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']" contains all available options at default
 * - algo        {String}   default: "SHA-512" uses SHA-512 hash algorithm as default
 * - extractable {Boolean}  default: "true" whether the key is extractable
 */
OpenCrypto.prototype.getKeyPair = function(bits, usage, alg, extractable) {
    var bits = (typeof bits !== 'undefined') ? bits : 2048;
    var usage = (typeof usage !== 'undefined') ? usage : ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'];
    var alg = (typeof alg !== 'undefined') ? alg : 'SHA-256';
    var extractable = (typeof extractable !== 'undefined') ? extractable : true;
    var self = this;
    return new Promise(function(resolve, reject) {
        if (typeof bits !== 'number') {
            throw new TypeError('Expected input of bits to be a Number');
        }

        if (typeof usage !== 'object') {
            throw new TypeError('Expected input of usage to be an Array');
        }

        if (typeof alg !== 'string') {
            throw new TypeError('Expected input of algo expected to be a String');
        }

        if (typeof extractable !== 'boolean') {
            throw new TypeError('Expected input of extractable to be a Boolean');
        }

        cryptoApi.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: bits,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: {name: alg}
            },
            extractable,
            usage
        ).then(function(keyPair) {
            resolve(keyPair);
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Converts asymmetric private key from CryptoKey to PEM format
 * - privateKey        {CryptoKey}  default: "undefined" CryptoKey generated by WebCrypto API
 */
 OpenCrypto.prototype.cryptoPrivateToPem = function(privateKey) {
     var self = this;
     return new Promise(function(resolve, reject) {
         if (typeof privateKey !== 'object') {
             throw new TypeError('Expected input to be a CryptoKey Object');
         }

         cryptoApi.exportKey(
             'pkcs8',
             privateKey
         ).then(function(exportedPrivateKey) {
             var b64 = self.arrayBufferToBase64(exportedPrivateKey);
             var pem = addNewLines(b64);
             pem = '-----BEGIN PRIVATE KEY-----\r\n' + pem + '-----END PRIVATE KEY-----';

             resolve(pem);
         }).catch(function(err) {
             reject(err);
         });
     });
 };

/**
 *
 * Converts asymmetric private key from PEM to CryptoKey format
 * - privateKey        {String}  default: "undefined" private key in PEM format
 */
OpenCrypto.prototype.pemPrivateToCrypto = function(pem) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if (typeof pem !== 'string') {
            throw new TypeError('Expected input of PEM to be a String');
        }

        pem = pem.replace('-----BEGIN PRIVATE KEY-----', '');
        pem = pem.replace('-----BEGIN RSA PRIVATE KEY-----', '');
        var b64 = pem.replace('-----END PRIVATE KEY-----', '');
        b64 = b64.replace('-----END RSA PRIVATE KEY-----', '');
        b64 = removeLines(b64);
        
        var arrayBuffer = self.base64ToArrayBuffer(b64);
        cryptoApi.importKey(
            'pkcs8',
            arrayBuffer,
            {
                name: 'RSA-OAEP',
                hash: {name: 'SHA-256'}
            },
            true,
            ['decrypt']
        ).then(function(importedPrivateKey) {
            resolve(importedPrivateKey);
        }).catch(function(err) {
            console.error(err);
            reject(err);
        });
    });
};

/**
 *
 * Converts asymmetric public key from CryptoKey to PEM format
 * - publicKey        {CryptoKey}  default: "undefined" CryptoKey generated by WebCrypto API
 */
OpenCrypto.prototype.cryptoPublicToPem = function(publicKey) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if (typeof publicKey !== 'object') {
            throw new TypeError('Expected input to be a CryptoKey Object');
        }

        cryptoApi.exportKey(
            'spki',
            publicKey
        ).then(function(exportedPublicKey) {
            var b64 = self.arrayBufferToBase64(exportedPublicKey);
            var pem = addNewLines(b64);
            pem = '-----BEGIN PUBLIC KEY-----\r\n' + pem + '-----END PUBLIC KEY-----';

            resolve(pem);
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Converts asymmetric public key from PEM to CryptoKey
 * - publicKey        {String}  default: "undefined" PEM public key
 */
OpenCrypto.prototype.pemPublicToCrypto = function(pem) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if (typeof pem !== 'string') {
            throw new TypeError('Expected input of PEM to be a String');
        }

        pem = removeLines(pem);
        pem = pem.replace('-----BEGIN PUBLIC KEY-----', '');
        pem = pem.replace('-----BEGIN RSA PUBLIC KEY-----', '');
        var b64 = pem.replace('-----END PUBLIC KEY-----', '');
        b64 = b64.replace('-----END RSA PUBLIC KEY-----', '');
        var arrayBuffer = self.base64ToArrayBuffer(b64);

        cryptoApi.importKey(
            'spki',
            arrayBuffer,
            {
                name: 'RSA-OAEP',
                hash: {name: 'SHA-512'}
            },
            true,
            ['encrypt', 'wrapKey']
        ).then(function(importedKey) {
            resolve(importedKey);
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Encrypts asymmetric private key based on passphrase to enable storage in unsecure environment
 * - privateKey        {CryptoKey}  default: "undefined" private key in CryptoKey format
 * - passphrase        {String}     default: "undefined" any passphrase string
 * - iterations        {Number}     default: "300000"
 * - hash              {String}     default: "SHA-512"
 * - cipher            {String}     default: "AES-CBC"
 * - keyLength         {Number}     default: "256"
 */
OpenCrypto.prototype.encryptPrivateKey = function(privateKey, passphrase, iterations, alg, cipher, keyLength) {
    var iterations = (typeof iterations !== 'undefined') ? iterations : 64000;
    var alg = (typeof alg !== 'undefined') ? alg : 'SHA-512';
    var cipher = (typeof cipher !== 'undefined') ? cipher : 'AES-CBC';
    var keyLength = (typeof keyLength !== 'undefined') ? keyLength : 256;
    var self = this;

    return new Promise(function(resolve, reject) {
        if (typeof privateKey !== 'object') {
            throw new TypeError('Expected input of privateKey to be a CryptoKey Object');
        }

        if (typeof passphrase !== 'string') {
            throw new TypeError('Expected input of passphrase to be a String');
        }

        if (typeof iterations !== 'number') {
            throw new TypeError('Expected input of iterations to be a Number');
        }

        if (typeof alg !== 'string') {
            throw new TypeError('Expected input of iterations to be a String');
        }

        var ivLength = null;
        if (cipher == 'AES-GCM') {
            ivLength = 12;
        } else if (cipher == 'AES-CBC') {
            ivLength = 16;
        } else if (cipher == 'AES-CFB') {
            ivLength = 16;
        }

        var salt = securePRNG.getRandomValues(new Uint8Array(16));
        var iv = securePRNG.getRandomValues(new Uint8Array(ivLength));

        cryptoApi.importKey(
            'raw',
            self.stringToArrayBuffer(passphrase),
            {
                name: 'PBKDF2'
            },
            false,
            ['deriveKey']
        ).then(function(baseKey) {
            cryptoApi.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: iterations,
                    hash: alg
                },
                baseKey,
                {
                    name: cipher,
                    length: keyLength
                },
                true,
                ['wrapKey']
            ).then(function(derivedKey) {
                cryptoApi.wrapKey(
                    'pkcs8',
                    privateKey,
                    derivedKey,
                    {
                        name: cipher,
                        iv: iv
                    }
                ).then(function(wrappedKey) {
                    var pemKey = toAsn1(wrappedKey, salt, iv, iterations, alg, cipher, keyLength, self);
                    resolve(pemKey);
                }).catch(function(err) {
                    reject(err);
                });
            }).catch(function(err) {
                reject(err);
            });
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Decrypts asymmetric private key by passphrase and salt
 * - encryptedPrivateKey        {base64 String}  default: "undefined" private key in PKCS #8 format
 * - passphrase                 {String}         default: "undefined" any passphrase string
 */
OpenCrypto.prototype.decryptPrivateKey = function(encryptedPrivateKey, passphrase) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if (typeof encryptedPrivateKey !== 'string') {
            throw new TypeError('Expected input of encryptedPrivateKey to be a base64 String');
        }

        if (typeof passphrase !== 'string') {
            throw new TypeError('Expected input of passphrase to be a String');
        }

        var epki = fromAsn1(encryptedPrivateKey, self);
        cryptoApi.importKey(
            'raw',
            self.stringToArrayBuffer(passphrase),
            {
                name: 'PBKDF2'
            },
            false,
            ['deriveKey']
        ).then(function(baseKey) {
            cryptoApi.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: epki.salt,
                    iterations: epki.iter,
                    hash: epki.hash
                },
                baseKey,
                {
                    name: epki.cipher,
                    length: epki.keyLength
                },
                true,
                ['unwrapKey']
            ).then(function(derivedKey) {
                cryptoApi.unwrapKey(
                    'pkcs8',
                    epki.encryptedData,
                    derivedKey,
                    {
                        name: epki.cipher,
                        iv: epki.iv
                    },
                    {
                        name: 'RSA-OAEP',
                        hash: {name: epki.hash}
                    },
                    true,
                    ['decrypt', 'unwrapKey']
                ).then(function(unwrappedKey) {
                    resolve(unwrappedKey);
                }).catch(function(err) {
                    reject(err);
                });
            }).catch(function(err) {
                reject(err);
            });
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Encrypts data using asymmetric encryption
 * Uses RSA-OAEP for asymmetric key as default.
 * - publicKey               {CryptoKey} default: "undefined"
 * - data                    {String} default: "undefined"
 */
OpenCrypto.prototype.encryptPublic = function(publicKey, data) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if (Object.prototype.toString.call(publicKey) !== '[object CryptoKey]' && publicKey.type !== 'public') {
            throw new TypeError('Expected input of privateKey to be a CryptoKey of type public');
        }

        if (typeof data !== 'string') {
            throw new TypeError('Expected input of data to be a String');
        }

        cryptoApi.encrypt(
            {
                name: 'RSA-OAEP'
            },
            publicKey,
            self.stringToArrayBuffer(data)
        ).then(function(encrypted) {
            resolve(self.arrayBufferToBase64(encrypted));
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Decrypts data using asymmetric encryption
 * Uses RSA-OAEP for asymmetric key as default.
 * - privateKey              {CryptoKey} default: "undefined"
 * - encryptedData           {base64 String} default: "undefined"
 */
OpenCrypto.prototype.decryptPrivate = function(privateKey, encryptedData) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if (Object.prototype.toString.call(privateKey) !== '[object CryptoKey]' && privateKey.type !== 'private') {
            throw new TypeError('Expected input of privateKey to be a CryptoKey of type private');
        }

        if (typeof encryptedData !== 'string') {
            throw new TypeError('Expected input of encryptedData to be a String');
        }

        cryptoApi.decrypt(
            {
                name: 'RSA-OAEP'
            },
            privateKey,
            self.base64ToArrayBuffer(encryptedData)
        ).then(function(decrypted) {
            resolve(self.arrayBufferToString(decrypted));
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Encrypts symmetric / shared key
 * Uses RSA-OAEP for asymmetric key as default.
 * - publicKey               {CryptoKey} default: "undefined"
 * - sharedKey               {CryptoKey} default: "undefined"
 * - publicKeyHash           {String} default: "SHA-512"
 */
OpenCrypto.prototype.encryptKey = function(publicKey, sharedKey, publicKeyHash) {
    var publicKeyHash = (typeof publicKeyHash !== 'undefined') ? publicKeyHash : 'SHA-512';
    var self = this;
    return new Promise(function(resolve, reject) {
        if (Object.prototype.toString.call(publicKey) !== '[object CryptoKey]' && publicKey.type !== 'public') {
            throw new TypeError('Expected input of publicKey to be a CryptoKey of type public');
        }

        if (Object.prototype.toString.call(sharedKey) !== '[object CryptoKey]' && sharedKey.type !== 'secret') {
            throw new TypeError('Expected input of sharedKey to be a CryptoKey of type secret');
        }

        cryptoApi.wrapKey(
            'raw',
            sharedKey,
            publicKey,
            {
                name: 'RSA-OAEP',
                hash: {name: publicKeyHash}
            }
        ).then(function(encryptedSharedKey) {
            resolve(self.arrayBufferToBase64(encryptedSharedKey));
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Decrypts symmetric / shared key
 * Uses RSA-OAEP for asymmetric key as default.
 * - privateKey              {CryptoKey} default: "undefined"
 * - encryptedSharedKey      {base64 String} default: "undefined"
 * - cipherSuite             {String} default: "AES-GCM"
 * - keyLength               {Number} default: "256"
 * - privateKeyLength        {Number} default: "2048"
 * - privateKeyHash          {String} default: "SHA-512"
 */
OpenCrypto.prototype.decryptKey = function(privateKey, encryptedSharedKey, cipher, keyLength, privateKeyLength, privateKeyHash) {
    var cipher = (typeof cipher !== 'undefined') ? cipher : 'AES-GCM';
    var keyLength = (typeof keyLength !== 'undefined') ? keyLength : 256;
    var privateKeyLength = (typeof privateKeyLength !== 'undefined') ? privateKeyLength : 2048;
    var privateKeyHash = (typeof privateKeyHash !== 'undefined') ? privateKeyHash : 'SHA-512';
    var self = this;
    return new Promise(function(resolve, reject) {
        if (Object.prototype.toString.call(privateKey) !== '[object CryptoKey]' && privateKey.type !== 'private') {
            throw new TypeError('Expected input of privateKey to be a CryptoKey of type private');
        }

        if (typeof encryptedSharedKey !== 'string') {
            throw new TypeError('Expected input of encryptedSharedKey to be a base64 String');
        }

        if (typeof cipher !== 'string') {
            throw new TypeError('Expected input of cipherSuite to be a String');
        }

        if (typeof keyLength !== 'number') {
            throw new TypeError('Expected input of keyLength to be a Number');
        }

        if (typeof privateKeyLength !== 'number') {
            throw new TypeError('Expected input of privateKeyLength to be a Number');
        }

        if (typeof privateKeyHash !== 'string') {
            throw new TypeError('Expected input of privateKeyHash to be a String');
        }

        cryptoApi.unwrapKey(
            'raw',
            self.base64ToArrayBuffer(encryptedSharedKey),
            privateKey,
            {
                name: 'RSA-OAEP',
                modulusLength: privateKeyLength,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: {name: privateKeyHash}
            },
            {
                name: cipher,
                length: keyLength
            },
            true,
            ['encrypt', 'decrypt']
        ).then(function(decryptedKey) {
            resolve(decryptedKey);
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Generates symmetric / shared key for AES encryption
 * Uses Galois/Counter Mode (GCM) for operation by default.
 * - bits              {Integer} default: "256" accepts 128 and 256
 * - usage             {Array}   default: "['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']" default contains all accepted values
 * - extractable       {Boolean} default: "false" whether the key can be exported
 * - cipherMode        {String}  default: "AES-GCM" Cipher block mode operation
 */
 OpenCrypto.prototype.getSessionKey = function(bits, usage, extractable, cipher) {
     var bits = (typeof bits !== 'undefined') ? bits : 256;
     var usage = (typeof usage !== 'undefined') ? usage : ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'];
     var extractable = (typeof extractable !== 'undefined') ? extractable : true;
     var cipher = (typeof cipher !== 'undefined') ? cipher : 'AES-GCM';
     var self = this;
     return new Promise(function(resolve, reject) {
         if (typeof bits !== 'number') {
             throw new TypeError('Expected input of bits to be a Number');
         }

         if (typeof usage !== 'object') {
             throw new TypeError('Expected input of usage to be an Array');
         }

         if (typeof extractable !== 'boolean') {
             throw new TypeError('Expected input of extractable expected to be a Boolean');
         }

         if (typeof cipher !== 'string') {
             throw new TypeError('Expected input of cipherMode expected to be a String');
         }

         cryptoApi.generateKey(
             {
                 name: cipher,
                 length: bits
             },
             extractable,
             usage
         ).then(function(sessionKey) {
             resolve(sessionKey);
         }).catch(function(err) {
             reject(err);
         });
     });
 };

 /**
 *
 * Encrypts data using symmetric / session key, converts them to
 * base64 format and prepends IV in front of the encrypted data.
 * Uses Galois/Counter Mode (GCM) for operation.
 * - sessionKey        {CryptoKey}  default: "undefined" symmetric / shared key
 * - data              {String}     default: "undefined" any data to be encrypted
 */
 OpenCrypto.prototype.encrypt = function(sessionKey, data) {
     var self = this;
     return new Promise(function(resolve, reject) {
         if (typeof sessionKey !== 'object') {
             throw new TypeError('Expected input of sessionKey to be a CryptoKey Object');
         }

         if (typeof data !== 'string') {
             throw new TypeError('Expected input of data to be a String');
         }

         var ivAb = securePRNG.getRandomValues(new Uint8Array(12));
         cryptoApi.encrypt(
             {
                 name: 'AES-GCM',
                 iv: ivAb,
                 tagLength: 128
             },
             sessionKey,
             self.base64ToArrayBuffer(data)
         ).then(function(encrypted) {
             var ivB64 = self.arrayBufferToBase64(ivAb);
             var encryptedB64 = self.arrayBufferToBase64(encrypted);
             resolve(ivB64 + encryptedB64);
         }).catch(function(err) {
             reject(err);
         });
     });
 };

 /**
 *
 * Decrypts data using symmetric / session key, extracts IV from
 * the front of the encrypted data and converts decrypted data
 * to base64. Uses Galois/Counter Mode (GCM) for operation.
 * - sessionKey        {CryptoKey}      default: "undefined" symmetric or session key
 * - encryptedData     {base64 String}  default: "undefined" any data to be decrypted
 */
 OpenCrypto.prototype.decrypt = function(sessionKey, encryptedData) {
     var self = this;
     return new Promise(function(resolve, reject) {
         if (typeof sessionKey !== 'object') {
             throw new TypeError('Expected input of sessionKey to be a CryptoKey Object');
         }

         if (typeof encryptedData !== 'string') {
             throw new TypeError('Expected input of encryptedData to be a String');
         }

         var ivB64 = encryptedData.substring(0, 16);
         var encryptedB64 = encryptedData.substring(16);
         var ivAb = self.base64ToArrayBuffer(ivB64);
         var encryptedAb = self.base64ToArrayBuffer(encryptedB64);

         cryptoApi.decrypt(
             {
                 name: 'AES-GCM',
                 iv: ivAb,
                 tagLength: 128
             },
             sessionKey,
             encryptedAb
         ).then(function(decrypted) {
             resolve(self.arrayBufferToBase64(decrypted));
         }).catch(function(err) {
             reject(err);
         });
     });
 };

/**
 *
 * Method for generating symmetric AES 256 bit key derived from passphrase and salt
 * - passphrase        {String}  default: "undefined" any passphrase string
 * - salt              {String}  default: "undefined" any salt, may be unique user ID for example
 * - iterations        {Number}  default: "300000"    number of iterations is 300 000 (Recommended)
 * - alg               {String}  default: "SHA-512"   hash algorithm
 */
OpenCrypto.prototype.keyFromPassphrase = function(passphrase, salt, iterations, alg) {
    var iterations = (typeof iterations !== 'undefined') ? iterations : 300000;
    var alg = (typeof alg !== 'undefined') ? alg : 'SHA-512';
    var self = this;
    return new Promise(function(resolve, reject) {
        if (typeof passphrase !== 'string') {
            throw new TypeError('Expected input of passphrase to be a String');
        }

        if (typeof salt !== 'string') {
            throw new TypeError('Expected input of salt to be a String');
        }

        if (typeof iterations !== 'number') {
            throw new TypeError('Expected input of iterations to be a Number');
        }

        if (typeof alg !== 'string') {
            throw new TypeError('Expected input of alg to be a String');
        }

        cryptoApi.importKey(
            'raw',
            self.stringToArrayBuffer(passphrase),
            {
                name: 'PBKDF2'
            },
            false,
            ['deriveKey']
        ).then(function(baseKey) {
            cryptoApi.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: self.stringToArrayBuffer(salt),
                    iterations: iterations,
                    hash: alg
                },
                baseKey,
                {
                    name: 'AES-GCM',
                    length: 256
                },
                true,
                ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
            ).then(function(derivedKey) {
                cryptoApi.exportKey(
                    'raw',
                    derivedKey
                ).then(function(exportedKey) {
                    resolve(self.arrayBufferToHexString(exportedKey));
                }).catch(function(err) {
                    reject(err);
                });
            }).catch(function(err) {
                reject(err);
            });
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Method for getting fingerprint of RSA public or private key
 * - key              {CryptoKey}  default: "undefined"
 * - alg              {String}      default: "SHA-1" can be used SHA-256, SHA-384 or SHA-512
 */
OpenCrypto.prototype.cryptoKeyToFingerprint = function(key, alg) {
    var alg = (typeof alg !== 'undefined') ? alg : 'SHA-1';
    var self = this;
    return new Promise(function(resolve, reject) {
        if (typeof key !== 'object') {
            throw new TypeError('Expected input of key to be a CryptoKey Object');
        }

        if (typeof alg !== 'string') {
            throw new TypeError('Expected input of hash to be a String');
        }

        var tmpKeyType = null;
        if (key.type == 'public') {
            tmpKeyType = 'spki';
        } else {
            tmpKeyType = 'pkcs8';
        }

        cryptoApi.exportKey(
            tmpKeyType,
            key
        ).then(function(keyAb) {
            cryptoApi.digest(
                {
                    name: alg,
                },
                keyAb
            ).then(function(fingerprint) {
                resolve(self.arrayBufferToHexString(fingerprint).toUpperCase().replace(/(.{4})/g, '$1 ').trim());
            }).catch(function(err) {
                reject(err);
            });
        }).catch(function(err) {
            reject(err);
        });
    });
};

/**
 *
 * Method for getting random salt using cryptographically strong PRNG
 * - Size              {number}  default: "16"
 */
OpenCrypto.prototype.getRandomSalt = function(size) {
    var size = (typeof size !== 'undefined') ? size : 16;
    var self = this;

    return new Promise(function(resolve, reject) {
        if (typeof size !== 'number') {
            throw new TypeError('Expected input of size to be a Number');
        }

        var salt = securePRNG.getRandomValues(new Uint8Array(size));
        var hexSalt = self.arrayBufferToHexString(salt);

        resolve(hexSalt);
    });
};

/**
 *
 * Generates Elliptic Curve Diffie-Hellman Key Pair
 * - curve              {number}  default: "P-256"
 */
OpenCrypto.prototype.getEcKeyPair = function(curve) {
    var curve = (typeof curve !== 'undefined') ? curve : 'P-256';

    return new Promise(function(resolve, reject) {
        if (typeof curve !== 'string') {
            throw new TypeError('Expected input of curve to be a String');
        }

        cryptoApi.generateKey(
            {
                name: 'ECDH',
                namedCurve: curve
            },
            true,
            ['deriveKey', 'deriveBits']
        ).then(function(keyPair) {
            resolve(keyPair);
        }).catch(function(err) {
            reject(err);
        });
    });
};
