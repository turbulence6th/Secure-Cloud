window.onload = function(){
    // your code
    document.getElementById("upload-key").onclick = function() {collapseupload()};
    document.getElementById("download-key").onclick = function() {collapsedownload()};
    function collapseupload() {
        document.getElementById("upload-key").style.display = "none";
        //document.getElementById("uppub").css('display','block');
        $("#uppub").css("display", "inline-block");
        $("#uppri").css("display", "inline-block");

    }

    function collapsedownload() {
        document.getElementById("download-key").style.display = "none";
        //document.getElementById("uppub").css('display','block');
        $("#downpub").css("display", "inline-block");
        $("#downpri").css("display", "inline-block");

    }
    $( "#show_upload_menu" ).click(function() {
      $( "#file_operations" ).toggle( "slide" );
    });




};