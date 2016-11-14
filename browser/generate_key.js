function generate_key() {
	
	var Username = document.getElementById('username').value;
	var Password = document.getElementById('password').value; 
	
	// owncloud login request	
	if (owncloudLoginRequest(Username,Password)) {
		// create rsa keys
	} else {
		alert("Login Failed");
	}
	
}

function owncloudLoginRequest(username,password) {
	var http = new XMLHttpRequest();
	var url = "http://144.122.238.189/owncloud/index.php/apps/endtoend/login";

	var data={};
    	data.username = username;
    	data.password = password;

	var string = JSON.stringify(data);

	http.open('POST',url,true);
    	http.setRequestHeader("Content-type", "application/json; charset=utf-8");
 


	http.onreadystatechange = function() {//Call a function when the state changes.
	    if(http.readyState == 4 && http.status == 200) {
		alert(http.responseText);
	    }
	    if (http.readyState != 4) return;
		if (http.status != 200 && http.status != 304) {
		    alert('HTTP error ' + http.status);
		    return;
		}

		data.resp = JSON.parse(http.responseText);
		if(data.resp.success==false){
		    alert('That didn\'t work!');
		    
		}else{
		    alert('That worked!');
	    }
	}


   	 http.send(string);

    return false; //prevent native form submit
}


// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('generate-key').addEventListener('click', generate_key);
  
});
