var username = "user";
var permissions = {

	"read" : true,
	"update" : true,
	"create" : false,
	"delete" : false,
	"share" : true,
	"changeShare" : true
};



setTimeout(function() {
     uploadFile(new File(["Secure Cloud End to End Security\n","Cengaverler"], "deneme.txt"));
}, 0);

setTimeout(function() {
	downloadFile(fileId);	
}, 4000);

setTimeout(function() {
	shareFile(fileId,username,permissions);
}, 8000);

setTimeout(function() {
	unshareFile(fileId,username);
}, 12000);

setTimeout(function() {
	shareFile(fileId,username,permissions);
}, 16000);







