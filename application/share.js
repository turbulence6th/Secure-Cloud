
function shareFile(key, iv, sharedWith, fileId) {
	console.log("file sharing");
	console.log(btoa(key));
	portObject.postMessage({
		type: "shareFile",
		fileId: fileId,
		sharedWith: sharedWith,
		sessionKey: btoa(key),
		iv: iv
	});
}


function unshareFile(fileId,username) {
	$.ajax({	

			url :  url + '/index.php/apps/endtoend/unshareFile',
			data :  {
				fileId : fileId,
				unsharedWith : username
			},
			//dataType : 'json',
			type : 'POST',
			success : function(data) {
				if (data.success) {
					console.log("The file has successfully unshared");
				}

			},
			async : true
		});	
}


function changeShareFile(fileId,username,permissions) {
	$.ajax({	
		url : url + '/index.php/apps/endtoend/changeShareFile',
		data :  {
			fileId : fileId,
			sharedWith : username,
			read : permissions["read"],
			update : permissions["update"],
			create : permissions["create"],
			delete : permissions["delete"],
			share : permissions["share"]
		},
		//dataType : 'json',
		type : 'POST',
		success : function(data) {
			if (data.success) {

			}

		},
		async : true
	});
}