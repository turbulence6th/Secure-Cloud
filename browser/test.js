var username = "user";
var permissions = {

	"read" : true,
	"update" : true,
	"create" : false,
	"delete" : false,
	"share" : true,
	"changeShare" : true
};
var groupname = "sharegroup";
var groupPermissions = {

	"read" : true,
	"update" : true,
	"create" : false,
	"delete" : false,
	"share" : false,
	"changeShare" : false
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

/*
setTimeout(function() {
     uploadFile(new File(["Secure Cloud End to End Security Share Group\n","Cengaverler"], "sharegroup.txt"));
}, 20000);

setTimeout(function() {
	createCryptoGroup(groupname);
}, 24000);

setTimeout(function() {
	AddNewMemberToGroup(groupname,"user")
}, 28000);

setTimeout(function() {
	ShareWithGroup(23,groupname,groupPermissions)
}, 32000);
*/




