package com.securecloud;

import java.io.IOException;

import javax.swing.JOptionPane;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class Main {

	private static int getInt(byte[] bytes) {
		return (bytes[3] << 24) & 0xff000000 | (bytes[2] << 16) & 0x00ff0000 | (bytes[1] << 8) & 0x0000ff00
				| (bytes[0] << 0) & 0x000000ff;
	}

	private static JsonObject receiveMessage() {

		byte[] b = new byte[4];

		try {
			System.in.read(b);
			int size = getInt(b);

			byte[] msg = new byte[size];
			System.in.read(msg);

			// make sure to get message as UTF-8 format
			String msgStr = new String(msg, "UTF-8");

			JsonParser parser = new JsonParser();
			return parser.parse(msgStr).getAsJsonObject();

		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}

	}

	private static byte[] getBytes(int length) {
		byte[] bytes = new byte[4];
		bytes[0] = (byte) (length & 0xFF);
		bytes[1] = (byte) ((length >> 8) & 0xFF);
		bytes[2] = (byte) ((length >> 16) & 0xFF);
		bytes[3] = (byte) ((length >> 24) & 0xFF);
		return bytes;
	}

	private static void sendMessage(JsonObject json) throws IOException {
		String message = json.toString();
		System.out.write(getBytes(message.length()));
		System.out.write(message.getBytes("UTF-8"));
		System.out.flush();
	}

	public static void main(String[] args) throws IOException {
	
		while(true) {
			JsonObject message = receiveMessage();
			JOptionPane.showMessageDialog(null, message);
			
			JsonObject jsonObject = new JsonObject();
			jsonObject.addProperty("deneme", message.get("type").getAsString());
			
			sendMessage(jsonObject);
		}
		
	}

}
