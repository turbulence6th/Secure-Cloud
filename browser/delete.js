function deleteFile(fileId) {
	$.ajax({
		url : url + '/index.php/apps/endtoend/deleteFile',
		data : {
			fileId: fileId
		},
		type : 'POST',
		success : function(data) {
			if(data.success){
				location.reload();
			}
		}
	});
}
