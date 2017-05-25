
class TestKey  {

	testAddKey(keyname) {
		if (!secure_key_names.includes(keyname) && keyname !== '')
			generate_key(keyname);
	}
	testImportKey(keyname, privatepem) {
		if (!secure_key_names.includes(keyname) && keyname !== '')
			import_key(keyname, privatepem);
	}
	testChooseKey(url, value) {
		 choose_key(url,value);
	}

}

var testKey = new TestKey();