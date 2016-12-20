
var folderName = "ChildFolder";
var parentId = 396;

var url = window.location.origin;

function newDirectory(name) {
	$.ajax({
		url : url + '/owncloud/index.php/apps/endtoend/newDirectory',
		data : {
			folderName : folderName,
			parentId : parentId
		},
		type : 'POST',
		success : function(data) {
			if(data.success){
				console.log("The folder has successfully created");
			}
		}
	});
}

document.getElementById("newDirectory").addEventListener("click",function() {newDirectory(folderName,parentId); });