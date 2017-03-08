var username = "user";
var permissions = {

	"read" : true,
	"update" : true,
	"create" : false,
	"delete" : false,
	"share" : true,
	"changeShare" : true
};
var groupname = "finalgroup";
var groupPermissions = {

	"read" : true,
	"update" : true,
	"create" : false,
	"delete" : false,
	"share" : false,
	"changeShare" : false
};

/*
setTimeout(function() {
     uploadFile(new File(["Secure Cloud End to End Security\n","Cengaverler"], "finaldemo.txt"));
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
*/


setTimeout(function() {
     uploadFile(new File(["Secure Cloud End to End Security Share Group\n","Cengaverler"], "finaldemogroup.txt"));
}, 1000);



setTimeout(function() {
	createCryptoGroup(groupname);
}, 5000);

setTimeout(function() {
	AddNewMemberToGroup(groupname,"user")
}, 9000);


setTimeout(function() {
	ShareWithGroup(fileId,groupname,groupPermissions)
}, 13000);


