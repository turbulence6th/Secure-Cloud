

function owncloudLogin() {
	var url = $("#login-url").val();
	url = url + "/index.php/apps/endtoend/login";
	var username = $("#login-username").val();
	var password = $("#login-password").val();
	$.ajax({    
        url : url,
        dataType : "jsonp",
        data :  {
            username : username,
            password : password
        },
        //dataType : 'json',
        type : 'POST',
        success : function(data) {
        	if (data.success == true) {
        		console.log("login successful");
        	}
        },
        async : true
    }); 

}



// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('owncloud-login').addEventListener('click', owncloudLogin);
  
});
