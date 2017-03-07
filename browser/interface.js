window.onload = function(){

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }

    function getGrid() {
        $.ajax({
            url: '/index.php/apps/endtoend/getFolder', 
            data: {
                folderId: getURLParameter('folderId')
            },
            success: function(response){
                $("#jsGrid").jsGrid({
                    width: "100%",
             
                    editing: true,
                    sorting: true,
                    paging: true,
             
                    data: response,

             
                    fields: [
                        { 
                            name: "Icon", 
                            itemTemplate: function(value, item) {
                                if(item.Mime == "httpd/unix-directory")
                                    return $('<i class="fa fa-folder-o" aria-hidden="true"></i>');
                                else if(item.Mime == "application\/pdf")
                                    return $('<i class="fa fa-file-pdf-o" aria-hidden="true"></i>');
                                else if(item.Mime == "image\/png" || item.Mime == "image\/jpeg" || item.Mime == "image\/gif"
                                    || item.Mime == "image\/bmp" || item.Mime == "image\/webp")
                                    return $('<i class="fa fa-file-image-o" aria-hidden="true"></i>');
                                else if(item.Mime == "application\/vnd.openxmlformats-officedocument.wordprocessingml.document" || item.Mime == "application\/msword")
                                    return $('<i class="fa fa-file-word-o" aria-hidden="true"></i>');
                                else if(item.Mime == "application\/vnd.openxmlformats-officedocument.presentationml.presentation")
                                    return $('<i class="fa fa-file-powerpoint-o" aria-hidden="true"></i>');
                                else if(item.Mime == "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                                    return $('<i class="fa fa-file-excel-o" aria-hidden="true"></i>');
                                else if(item.Mime == "video\/mp4" || item.Mime == "video\/webm" || item.Mime == "video\/ogg")
                                    return $('<i class="fa fa-file-video-o" aria-hidden="true"></i>');
                                else if(item.Mime == "audio/midi" || item.Mime == "audio\/mpeg" || 
                                    item.Mime == "audio\/webm" || item.Mime == "audio\/ogg" || item.Mime == "audio\/wav")
                                    return $('<i class="fa fa-file-audio-o" aria-hidden="true"></i>');
                                else
                                    return $('<i class="fa fa-file-o" aria-hidden="true"></i>');
                            },
                            sorting: false,
                            css: "text-align: center",
                            width: "20px"
                        },
                        { 
                            name: "Name", 
                            type: "text", 
                            width: 200, 
                            validate: "required" },
                        { 
                            name: "Size", 
                            type: "text", 
                            width: 25, 
                            editing: false},
                        { 
                            name: "Modified", 
                            type: "text", 
                            width: 75, 
                            editing: false },
                        { 
                            name: "File / Folder", 
                            itemTemplate: function(value, item) {
                                if (item.Mime == "httpd/unix-directory")
                                    return $('<button title="Go to folder"><i class="fa fa-sign-in" aria-hidden="true"></i></button>')
                                        .on("click", function() {
                                            window.location = '/index.php/apps/endtoend?folderId=' + item.id;
                                        });
                                else
                                    return $('<button title="Download"><i class="fa fa-download" aria-hidden="true"></i></button>')
                                        .on("click", function() {
                                            downloadFile(item.id);
                                        });
                            },
                            sorting: false,
                            css: "text-align: center",
                            width: "50px"
                        },
                        { 
                            type: "control"
                         }
                    ],
                    controller: {
                        updateItem: function(item){
                            //send item.id and item.Name to server
                        },
                        deleteItem: function(item) {
                            deleteFile(item.id);
                        }
                    },
                    rowClick: function(arg) {
                        
                    },
                    onRefreshed: function() {
                        
                    }
                });
            }
        });
    }

    getGrid();

    $("#uploadFile").change(function(){
        uploadFile(document.getElementById('uploadFile').files[0]);
    });

    $("#uploadFolderButton").on('click', function(){
        newDirectory(document.getElementById("folderName").value, getURLParameter('folderId'));
    });

    
};