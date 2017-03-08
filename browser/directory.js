var url = window.location.origin;

function newDirectory(folderName, parentId) {
	$.ajax({
		url : url + '/index.php/apps/endtoend/newDirectory',
		data : {
			folderName : folderName,
			parentId : parentId
		},
		type : 'POST',
		success : function(data) {
			if(data.success){
				$("#jsGrid").jsGrid("refresh");
			}
		}
	});
}