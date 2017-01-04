
function deleteFile(fileId) {
	$.ajax({
		url : url + '/owncloud/index.php/apps/endtoend/deleteFile',
		data : {
			fileId: fileId
		},
		type : 'POST',
		success : function(data) {
			if(data.success){
				console.log("The file has successfully deleted");
			}
		}
	});
}

document.getElementById("deleteFile").addEventListener("click",function() {deleteFile(fileId); });
