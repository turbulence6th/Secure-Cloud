package com.securecloud;

import javacard.framework.*;
import javacard.security.KeyBuilder;
import javacard.security.KeyPair;
import javacard.security.RSAPrivateKey;
import javacard.security.RSAPublicKey;
import javacardx.crypto.Cipher;

public class SmartCard extends Applet
{
  
  RSAPrivateKey thePrivateKey;
  RSAPublicKey thePublicKey;
  KeyPair theKeyPair;
  
  final static byte SECURE_CLA = (byte) 0xb0;
  final static byte DECRYPT = (byte) 0x20;
  final static byte ENCRYPT = (byte) 0x30;
  final static byte GETPEM = (byte) 0x40;

  private SmartCard() {
    thePrivateKey = (RSAPrivateKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PRIVATE, KeyBuilder.LENGTH_RSA_512,
        false);
    thePublicKey = (RSAPublicKey) KeyBuilder.buildKey(KeyBuilder.TYPE_RSA_PUBLIC, KeyBuilder.LENGTH_RSA_512,
        false);
    theKeyPair = new KeyPair(thePublicKey, thePrivateKey);
    theKeyPair.genKeyPair();
  }
  
  public static void install(byte[] bArray, short bOffset, byte bLength) 
  {
    new SmartCard().register(bArray, (short) (bOffset + 1), bArray[bOffset]);
  }

  public void process(APDU apdu)
  {
    /*if (selectingApplet())
    {
      return;
    }

    byte[] buf = apdu.getBuffer();
    switch (buf[ISO7816.OFFSET_INS])
    {
    case (byte)0x00:
      break;
    default:
      ISOException.throwIt(ISO7816.SW_INS_NOT_SUPPORTED);
    }*/
    
    if (selectingApplet()) {
      return;
    }

    short length = apdu.setIncomingAndReceive();
    byte[] buffer = apdu.getBuffer();

    if (buffer[ISO7816.OFFSET_CLA] != 0 && buffer[ISO7816.OFFSET_INS] == (byte) 0xA4) {
      return;
      
    }
    
    

    if (buffer[ISO7816.OFFSET_CLA] != SECURE_CLA) {
      ISOException.throwIt(ISO7816.SW_CLA_NOT_SUPPORTED);
    }

    
    if (buffer[ISO7816.OFFSET_INS] == DECRYPT) {
      int size = buffer[ISO7816.OFFSET_LC+1]*16 + buffer[ISO7816.OFFSET_LC+2];
      byte[] byteArray = new byte[(short)size];
      for (short i=0; i < size; i++) {
        byteArray[i] = buffer[ISO7816.OFFSET_EXT_CDATA+i];
      }
      
      byte[] outbuffer = new byte[(short) (size * 2)];
      short length = 0;
      Cipher cipher = Cipher.getInstance(Cipher.ALG_RSA_PKCS1, false); 
      cipher.init(thePrivateKey, Cipher.MODE_DECRYPT); 
      length = cipher.doFinal(outbuffer, (short)0, (short)size, outbuffer, (short)0);
      Util.arrayCopy(outbuffer, (short)0, buffer, (short)0, length);
      apdu.setOutgoingAndSend( (short)0, length);
      
    }
    
    else if(buffer[ISO7816.OFFSET_INS] == ENCRYPT){
  
      short length = 0;
  
      Util.arrayCopy(buffer, (short) 5, inbuffer, (short) 0, incomingLenght);
      Cipher cipher = Cipher.getInstance(Cipher.ALG_RSA_PKCS1, false); 
      cipher.init(thePublicKey, Cipher.MODE_ENCRYPT); 
      length = cipher.doFinal(inbuffer, ISO7816.OFFSET_EXT_CDATA, (short)incomingLenght, outbuffer, (short)0);
      Util.arrayCopy(outbuffer, (short)0, buffer, (short)0, length);
      apdu.setOutgoingAndSend( (short)0, length);
      
    }
    
    else if (buffer[ISO7816.OFFSET_INS] == GETPEM) {
      
    }
    else {
      ISOException.throwIt(ISO7816.SW_INS_NOT_SUPPORTED);
    }
  }

}