/**
 * ownCloud - endtoend
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Cengaverler <oguz.tanrikulu@metu.edu.tr>
 * @copyright Cengaverler 2016
 */

	$(document).ready(function() {
		
		function arrayBufferToBase64(arrayBuffer) {
		    var byteArray = new Uint8Array(arrayBuffer);
		    var byteString = '';
		    for(var i=0; i < byteArray.byteLength; i++) {
		        byteString += String.fromCharCode(byteArray[i]);
		    }
		    var b64 = window.btoa(byteString);
		
		    return b64;
		}
		
		function base64ToArrayBuffer(b64) {
		    var byteString = window.atob(b64);
		    var byteArray = new Uint8Array(byteString.length);
		    for(var i=0; i < byteString.length; i++) {
		        byteArray[i] = byteString.charCodeAt(i);
		    }
		
		    return byteArray;
		}
		
		function escapeHtml(unsafe) {
		    return unsafe
		         .replace(/&/g, "&amp;")
		         .replace(/</g, "&lt;")
		         .replace(/>/g, "&gt;")
		         .replace(/"/g, "&quot;")
		         .replace(/'/g, "&#039;");
		 }
		 
		 function unescapeHtml(unsafe) {
		    return unsafe
		         .replace(/&amp;/g, "&")
		         .replace(/&lt;/g, "<")
		         .replace(/&gt;/g, ">")
		         .replace(/&quot;/g, '"')
		         .replace(/&#039;/g, "'");
		 }
		
		var port = chrome.runtime.connect("mkfgfpmdncklopnjonmbgbgfgehacpbn");
		
		port.onDisconnect.addListener(function() {
			$("#check-application").toggleClass("hidden visible");
		});
		
		port.postMessage({
			type: "login",
			url: document.location.hostname
		});
		
		port.onMessage.addListener(function(request, port) {
			if(request.type == "hasKey") {
				if(!request.found) {
					$("#check-key").toggleClass("hidden visible");
				}
			}
			
			else if(request.type == "generateKey") {
				$.ajax({    
			        url : OC.generateUrl('/apps/endtoend/setPublicKey'),
			        data :  {
			            key: request.key
			        },
			        type : 'POST',
			        success : function(data) {
						port.postMessage({
							type: "generateKey",
							success: data.success,
							url: location.hostname
						});
						
						if(data.success) {
							$("#check-key").toggleClass("visible hidden");
						}
			        },
			        async : true
			    });
			}
			
			else if(request.type == "uploadFile") {
				var formData = new FormData();
				formData.append('file',request.file);
				formData.append('filename',request.fileName);
				formData.append('encryptedKey', request.encryptedKey);
				formData.append('iv', request.iv);
				formData.append('folderId', getURLParameter('folderId'));
				$.ajax({	
					url : OC.generateUrl('/apps/endtoend/fileUpload'),
					data : formData,
					cache : false,
					contentType : false,
					processData : false,
					type : 'POST',
					success : function(data) {
						if(data.success){
							location.reload();
						}
					}
				});
			}
			
			else if(request.type == "downloadFile") {
				var a = document.createElement("a");
			    document.body.appendChild(a);
			    a.style = "display: none";
			    var blob = new Blob([base64ToArrayBuffer(request.data)], {type: "application/octet-stream"}),
			    url = window.URL.createObjectURL(blob);
			    a.href = url;
			    a.download = request.fileName;
			    a.click();
			    window.URL.revokeObjectURL(url);
			}	
			
			else if(request.type == "shareFile") {
				$.ajax({	
					url : OC.generateUrl('/apps/endtoend/shareFile'),
					data :  {
						sharedType : request.sharedType,
						sharedWith : request.sharedWith,
						sessionKeys : request.sessionKeys,
						fileId: request.fileId
					},
					type : 'POST',
					success : function(data) {
						if (data.success) {
							
						}
			
					},
					async : true
				});
			}
			
			else if(request.type == "createCryptoGroup") {
				$.ajax({	
					url : OC.generateUrl('/apps/endtoend/createCryptoGroup'),
					data :  {
						groupName : request.groupname,
						secretKey : request.secretKey,
						iv: request.iv
					},
					//dataType : 'json',
					type : 'POST',
					success : function(data) {
						if (data.success) {
							var alert = "<div id='new-group-alert' style='margin-top: 6px;' class='alert alert-success'><center>Crypto group named "+ request.groupname +" has created</center></div>";
							$("#cryptopanel").prepend(alert);
							setTimeout(function(){$("#new-group-alert").remove();}, 3000);
						}
		
					},
					async : true
				});
			}
			
			else if(request.type == "addMember") {
				$.ajax({	
					url : OC.generateUrl('/apps/endtoend/addNewMemberToGroup'),
					data :  {
						groupName : request.groupname,
						username : request.username,
						secretKey : request.secretKey,
						iv: request.iv
					},
					//dataType : 'json',
					type : 'POST',
					success : function(data) {
						if (data.success) {
							var alert = "<div id='new-add-member-alert' style='margin-top: 6px;' class='alert alert-success'><center>The user named "+ request.username + " has added to crypto group " + request.groupname + "</center></div>";
							$("#cryptopanel").prepend(alert);
							setTimeout(function(){$("#new-add-member-alert").remove();}, 3000);
						}
		
					},
					async : true
				});
			}
		});
		
		$('#uploadFileButton').on('click', function() {
			
			$('#uploadFile').trigger('click');
			
		});
		
		$('#new-folder').on('click', function() {
			inputClear();
			if ($("#new-folder-panel").hasClass("hidden")) {
				$("#new-folder-panel").toggleClass("hidden visible");
			} else {
				$("#new-folder-panel").toggleClass("visible hidden");
			}
		});
		
		$('#new-crypto').on('click', function() {
			if ($("#new-crypto-group-panel").hasClass("hidden")) {
				$("#new-crypto-group-panel").toggleClass("hidden visible");
			} else {
				$("#new-crypto-group-panel").toggleClass("visible hidden");
			}
		});
		
		$('#add-member').on('click', function() {
			if ($("#new-add-member-panel").hasClass("hidden")) {
				$("#new-add-member-panel").toggleClass("hidden visible");
			} else {
				$("#new-add-member-panel").toggleClass("visible hidden");
			}
		});
		
		
		$('#createCryptoGroup').on('click', function() {
			port.postMessage({
				type: "createCryptoGroup",
				groupname: $('#cryptoGroup').val()
			});
		});
		
		$('#addMemberCryptoGroup').on('click', function() {
			
			$.ajax({	
				url : OC.generateUrl('/apps/endtoend/preAddNewMemberToGroup'),
				data :  {
					groupName : $('#addMemberGroup').val(),
					username : $('#addMemberMember').val(),
				},
				//dataType : 'json',
				type : 'POST',
				success : function(data) {
					if (data.success) {
						
						port.postMessage({
							type: "addMember",
							groupname: $('#addMemberGroup').val(),
							member: $('#addMemberMember').val(),
							secretKey: data.secretKey,
							publicKey: data.publicKey,
							iv: data.iv
						});
			
					}
		
				},
				async : true
			});
			
		});
		
		$('#leaveCryptoGroup').on('click', function() {
			
			$.ajax({	
				url : OC.generateUrl('/apps/endtoend/leaveFromGroup'),
				data :  {
					groupName : $('#cryptoGroupLeave').val()
				},
				//dataType : 'json',
				type : 'POST',
				success : function(data) {
					var alert = "<div id='leave-group-alert' style='margin-top: 6px;' class='alert alert-success'><center>You have been left from crypto group "+ $('#cryptoGroupLeave').val()  +"</center></div>";
						$("#cryptopanel").prepend(alert);
						setTimeout(function(){$("#leave-group-alert").remove();}, 3000);
		
				},
				async : true
			});
			
		});
		
		var fileid = 0;
		var isFolder = false;
		window.onload = function(){
		    
		    function getURLParameter(name) {
		        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
		    }
		
		    function getGrid() {
		        $.ajax({
		            url: OC.generateUrl('/apps/endtoend/getFolder'),
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
		                                    return $('<i data-icon-id="'+ item.id +'"  class="fa fa-folder-o"  aria-hidden="true"></i>');
		                                else if(item.Mime == "application\/pdf")
		                                    return $('<i data-icon-id="'+ item.id +'" class="fa fa-file-pdf-o " aria-hidden="true"></i>');
		                                else if(item.Mime == "image\/png" || item.Mime == "image\/jpeg" || item.Mime == "image\/gif"
		                                    || item.Mime == "image\/bmp" || item.Mime == "image\/webp")
		                                    return $('<i data-icon-id="'+ item.id +'" class="fa fa-file-image-o" aria-hidden="true"></i>');
		                                else if(item.Mime == "application\/vnd.openxmlformats-officedocument.wordprocessingml.document" || item.Mime == "application\/msword")
		                                    return $('<i data-icon-id="'+ item.id +'" class="fa fa-file-word-o" aria-hidden="true"></i>');
		                                else if(item.Mime == "application\/vnd.openxmlformats-officedocument.presentationml.presentation")
		                                    return $('<i data-icon-id="'+ item.id +'" class="fa fa-file-powerpoint-o" aria-hidden="true"></i>');
		                                else if(item.Mime == "application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		                                    return $('<i data-icon-id="'+ item.id +'" class="fa fa-file-excel-o" aria-hidden="true"></i>');
		                                else if(item.Mime == "video\/mp4" || item.Mime == "video\/webm" || item.Mime == "video\/ogg")
		                                    return $('<i data-icon-id="'+ item.id +'" class="fa fa-file-video-o" aria-hidden="true"></i>');
		                                else if(item.Mime == "audio/midi" || item.Mime == "audio\/mpeg" || 
		                                    item.Mime == "audio\/webm" || item.Mime == "audio\/ogg" || item.Mime == "audio\/wav")
		                                    return $('<i data-icon-id="'+ item.id +'" class="fa fa-file-audio-o" aria-hidden="true"></i>');
		                                else
		                                    return $('<i data-icon-id="'+ item.id +'" class="fa fa-file-o" aria-hidden="true"></i>');
		                            },
		                            sorting: false,
		                            css: "text-align: center",
		                            width: "5%"
		                        },
		                        { 
		                            name: "Name", 
		                            type: "text", 
		                            width: "40%", 
		                            validate: "required" },
		                        { 
		                            name: "Size", 
		                            type: "text", 
		                            width: "10%", 
		                            editing: false},
		                        { 
		                            name: "Modified", 
		                            type: "text", 
		                            width: "25%", 
		                            editing: false },
		                        { 
		                            name: "Download", 
		                            itemTemplate: function(value, item) {
		                                if (item.Mime == "httpd/unix-directory")
		                                    return $('<button title="Go to folder"><i class="fa fa-sign-in" aria-hidden="true"></i></button>')
		                                        .on("click", function() {
		                                            window.location = '/index.php/apps/endtoend?folderId=' + item.id;
		                                        });
		                                else
		                                    return $('<button title="Download"><i class="fa fa-download" aria-hidden="true"></i></button>')
		                                        .on("click", function() {
		                                            $.ajax({	
														url : OC.generateUrl('/apps/endtoend/downloadFile'),
														data :  {
															fileId : item.id
														},
														type : 'GET',
														success : function(data) {
															port.postMessage({
																type: "downloadFile",
																file: data.file,
																sessionKey: data.sessionKey,
																secretKey: data.secretKey,
																fileName: data.fileName,
																sessioniv: data.sessioniv,
																secretiv: data.secretiv
															});
														},
														async : true
													});	
		                                        });
		                            },
		                            sorting: false,
		                            css: "text-align: center",
		                            width: "8%"
		                        },
		                        { 
		                            type: "control",
		                            width: "12%"
		                         }
		                    ],
		                    controller: {
		                        updateItem: function(item){
		                           $.ajax({
										url : OC.generateUrl('/apps/endtoend/renameFile'),
										data : {
											fileId: item.id,
											filename: item.Name
										},
										type : 'POST',
										success : function(data) {
											
										}
									});
		                        },
		                        deleteItem: function(item) {
		                            $.ajax({
										url : OC.generateUrl('/apps/endtoend/deleteFile'),
										data : {
											fileId: item.id
										},
										type : 'POST',
										success : function(data) {
											
										}
									});
		                        }
		                    },
		                    rowClick: function(arg) {
		                        $(".cryptosidebaritem").removeClass("visible");
		                        $(".cryptosidebaritem").addClass("hidden");
		                        $("#sharesBy").html("");
		                        $("#shared-users").html("");
		                        $("#cryptopanel").removeClass("col-md-12");
		                        $("#cryptopanel").addClass("col-md-8");
		                        $(".cryptoTabs").removeClass("selected");
		                        $("#groupsidebar").removeClass("visible");
		                        $("#groupsidebar").addClass("hidden");
		                        $("#cryptosidebar").removeClass("hidden");
		                        $("#cryptosidebar").addClass("visible");
		                        $("#filename").html(arg.item.original);
		                        inputClear();
		                        var info = arg.item.Size + " , " + arg.item.Modified;
		                        $("#filesizeanddate").html(info);
		                        icon = $(".fa[data-icon-id=" + arg.item.id + "]").parent().html();
		                        fileid = arg.item.id;
		                        if (arg.item.Mime == "httpd/unix-directory") 
		                            isFolder = true;
		                        else 
		                            isFolder = false;
		                        $("#cryptofileicon").html(icon);
		                        $("#cryptofileicon").children(".fa").addClass("fa-4x");
		                    },
		                    onRefreshed: function() {
		                        
		                    }
		                });
		            }
		        });
		    }
		
		    getGrid();
		   
		    $("#uploadFile").change(function(){
		    	var file = document.getElementById('uploadFile').files[0];
		    	
		    	$.ajax({    
			        url : OC.generateUrl('/apps/endtoend/preFileUpload'),
			        data :  {
			            folderId: getURLParameter('folderId') ? getURLParameter('folderId') : "null",
			            filename: file.name
			        },
			        //dataType : 'json',
			        type : 'GET',
			        success : function(data) {
			        	var reader = new FileReader();
						reader.onload = function (readerEvt) {
							port.postMessage({
					        	type: "uploadFile",
					        	file: arrayBufferToBase64(readerEvt.target.result),
					        	fileName : file.name,
					        	sessionkey: data.sessionkey,
					        	sessioniv: data.sessioniv,
					        	secretkey: data.secretkey,
					        	secretiv: data.secretiv
					        });
						};
						reader.onerror = function (error) {
						   	console.log('Error: ', error);
						};
				        reader.readAsArrayBuffer(file);
			        }
		        });
		    	
		    	
		    });
		
		    $("#uploadFolderButton").on('click', function(){
		        $.ajax({    
			        url : OC.generateUrl('/apps/endtoend/newDirectory'),
			        data :  {
			            parentId : getURLParameter('folderId'),
			            folderName: document.getElementById("folderName").value
			        },
			        //dataType : 'json',
			        type : 'POST',
			        success : function(data) {
			        	location.reload();
			        }
		        });
		        
		    });
		
		    
		};
		
		function filePermissions(permissions,isFolder) {
		    var sharePerm = " ",deletePerm = "",createPerm = "",updatePerm= "";
		    if (Math.floor(permissions/16) == 1) {
		        sharePerm += "<input type='checkbox' id='sharePerm' class='changePerm' checked> can share </input>";
		    } else {
		        sharePerm += "<input type='checkbox' id='sharePerm' class='changePerm'> can share </input>";
		    }
		    permissions = permissions%16;
		    if (isFolder) {
		        if (Math.floor(permissions/8) == 1) {
		            deletePerm = "<input type='checkbox' id='deletePerm' class='changePerm' checked > delete </input>"; 
		        } else {
		            deletePerm = "<input type='checkbox' id='deletePerm' class='changePerm' > delete </input>";
		        }
		    }
		    permissions = permissions%8;
		    if (isFolder) {
		        if (Math.floor(permissions/4) == 1) {
		            createPerm = "<input type='checkbox' id='createPerm' class='changePerm' checked > create </input>"; 
		        } else {
		            createPerm = "<input type='checkbox' id='createPerm' class='changePerm' > create </input>";
		        }
		    }
		    permissions = permissions%4;
		    if (Math.floor(permissions/2) == 1) {
		        updatePerm = "<input type='checkbox' id='updatePerm' class='changePerm' checked > change </input>";
		    } else {
		        updatePerm = "<input type='checkbox' id='updatePerm' class='changePerm'> change </input>";
		    }
		    return sharePerm + createPerm + updatePerm + deletePerm;
		}
		
		function getShareInfo(fileId) {
		    $.ajax({    
		        url : OC.generateUrl('/apps/endtoend/sharedUsersAndGroups'),
		        data :  {
		            fileId : fileId
		        },
		        //dataType : 'json',
		        type : 'GET',
		        success : function(data) {
		            if (data.success) {
		                data = data.data;
		                var sharedwith = "";
		                for (var i in data) {
		
		                    if (data[i]['property'] == "sharesBy" ) {
		                        var info;
		                        if (data[i]['type'] == "user")
		                            info = "<div class='avatar'>" + data[i]['name'][0].toUpperCase() + "</div> Shared with you by " + data[i]['name'];
		                        else
		                            info = "<div class='avatar'>" + data[i]['name'][0].toUpperCase() +"</div> Shared with you and the group " + data[i]['sharedWith'] + " by " + data[i]['name'];
		                        $("#sharesBy").html(info);
		                        if(Math.floor(data[i]['permissions']/16) == 0) {
		                        	$('#inputShare').prop('disabled', true);
		                        	$('#inputShare').attr('placeholder','You are not allowed to share');
		                        }
		                    }
		                    else {                   
		                        info = "<div style='display:block; padding:4px; border: 1px solid rgb(139, 116, 231);'  data-name='" + data[i]['name'] +"' data-type='" + data[i]['type']+ "'>";
		                        info += "<i class='fa fa-lg fa-trash remove-share' style='float:right;'></i>";
		                        info += "<div class='avatar'>"+ data[i]['name'][0].toUpperCase() + "</div>";
		                        info += data[i]['name'];
		                        if (data[i]['type'] == "group")
		                            info += "(group)";
		                        info += filePermissions(data[i]['permissions'],data[i]['isFolder']);
		                        info += "</div>";
		                        sharedwith += info;
		                    }
		                }
		                $("#shared-users").html(sharedwith);
		            }
		
		        },
		        async : true
		    });
		};
		
		function getCommentInfo(fileId) {
			$.ajax({    
		        url : OC.generateUrl('/apps/endtoend/getComments'),
		        data :  {
		            fileId : fileId
		        },
		        //dataType : 'json',
		        type : 'GET',
		        success : function(data) {
		        	var commentRow = "";
		            for (var i in data) {
		            	var comment = data[i];
		            	commentRow += commentInfoDivision(comment);
		            }
		            $("#comments").html(commentRow);
					
		        },
		        async : true
		    });
		};
		
		function commentInfoDivision(comment) {
			var commentRow = "<div data-commentid='"+ comment['id'] +"' style='margin-botton:4px;'><div style='block' >";
        	commentRow += "<div class='avatar'>"+ comment['user'][0].toUpperCase() + "</div>";
        	commentRow += comment['user'];
        	commentRow += " <i role='button' class='fa fa-pencil edit-comment' title='Edit Comment'></i>";
        	commentRow += "<i role='button' style='float:right; padding:2px;' class='fa fa-lg fa-trash hidden comment-delete'></i>";
        	commentRow += "<div class='comment-time' style='float:right;'> " + comment['time'] + "</div> </div>";
        	commentRow += "<div class='edit-comment-div hidden'>";
        	commentRow += "<textarea style='margin:4px;' class='form-control edit-comment-msg' rows='3'>"+ comment['message'] +"</textarea>";		    	
        	commentRow += "<button class='save-edit-comment' style='margin-right: 4px;'>Save</button>";
        	commentRow += "<button class='cancel-edit-comment'>Cancel</button>";
        	commentRow += "</div>";
        	commentRow += "<div class='comment-msg' style='display:block; margin-top:6px;'>"+ escapeHtml(comment['message']) +"</div>";
        	commentRow += "</div>";
        	return commentRow;
		};
		
		$('body').on('click', '.comment-delete', function() {
			var that = this;
			$.ajax({	
				url : OC.generateUrl('/apps/endtoend/deleteComment'),
				data :  {
					commentId : $(this).parent().parent().data('commentid')
					
				},
				//dataType : 'json',
				type : 'POST',
				success : function(data) {
					var commentdiv = $(that).parent().parent();
					commentdiv.remove();

				},
				async : true
			});
		});
		
		$('body').on('click', '.save-edit-comment', function() {
			var message = $(this).siblings('textarea').val();
			var that = this;
			$.ajax({	
				url : OC.generateUrl('/apps/endtoend/editComment'),
				data :  {
					commentId : $(this).parent().parent().data('commentid'),
					message : message
					
				},
				//dataType : 'json',
				type : 'POST',
				success : function(data) {
					var editdiv = $(that).parent();
					editdiv.siblings(".comment-msg").html(escapeHtml(message));
					editdiv.siblings(".comment-msg").toggleClass("hidden visible");
					editdiv.toggleClass("visible hidden");
					$(".comment-delete").toggleClass("visible hidden");
					$(".comment-time").toggleClass("hidden visible");
				},
				async : true
			});
		});
		
		$('#commentPost').on('click', function() {
			var message = $('#inputComment').val();
			$.ajax({	
				url : OC.generateUrl('/apps/endtoend/makeComment'),
				data :  {
					fileId : fileid,
					message : message
					
				},
				//dataType : 'json',
				type : 'POST',
				success : function(data) {
					var commentRow = commentInfoDivision(data.comment);
					$('#comments').prepend(commentRow);
				},
				async : true
			});
		});
		
		$('body').on('click', '.cancel-edit-comment', function() {
			var editdiv = $(this).parent();
			editdiv.siblings(".comment-msg").toggleClass("hidden visible");
			editdiv.toggleClass("visible hidden");
			$(".comment-delete").toggleClass("visible hidden");
			$(".comment-time").toggleClass("hidden visible");
		});
		$('body').on('click', '.edit-comment', function() {
			var editdiv = $(this).parent().siblings('.edit-comment-div');
			editdiv.children("textarea").val(unescapeHtml($(this).parent().siblings(".comment-msg").html()));
			$(this).parent().siblings(".comment-msg").toggleClass("visible hidden");
			editdiv.toggleClass("hidden visible");
			$(".comment-delete").toggleClass("hidden visible");
			$(".comment-time").toggleClass("visible hidden");
		});
		
		$("#closecryptosidebar").on('click', function() {
		    $("#cryptopanel").toggleClass("col-md-8 col-md-12");
		    $("#cryptosidebar").toggleClass("visible hidden");
		    $(".cryptosidebaritem").removeClass("visible");
		    $(".cryptoTabs").removeClass("selected");
		    $(".cryptosidebaritem").addClass("hidden");
		    inputClear();
		});
		
		$("#crypto-group-menu").on('click', function() {
			$("#groupsidebar").toggleClass("hidden visible");
			$("#cryptosidebar").removeClass("visible");
			$("#cryptosidebar").addClass("hidden");
			$("#cryptopanel").removeClass("col-md-12");
			$("#cryptopanel").addClass("col-md-8");
			
			inputClear();
			
		});
		
		function inputClear() {
			$("input").val('');
			$("textarea").val('');
			$("#inputShare").prop("disabled", false);
			$('#inputShare').attr("placeholder", "Share with users or groups");
		}
		
		$("#closegroupsidebar").on('click', function() {
		    $("#cryptopanel").toggleClass("col-md-8 col-md-12");
		    $("#groupsidebar").toggleClass("visible hidden");
			inputClear();
		});
		
		$(".cryptoTabs").on('click', function() {
		    var id = $(this).data("tab-id");
		    $(".cryptosidebaritem").removeClass("visible");
		    $(".cryptoTabs").removeClass("selected");
		    $(".cryptosidebaritem").addClass("hidden");
		    division = $(".cryptosidebaritem[data-crypto-tab=" +  id + "]");
		    division.toggleClass("hidden visible");
		    $(this).addClass("selected");
		    if ( $(this).data("tab-id") == 1  ) {
		        getCommentInfo(fileid);
		    }
		    if ( $(this).data("tab-id") == 2  ) {
		        getShareInfo(fileid);
		    }
		    inputClear();
		});
		
		
		$( "#inputShare" ).autocomplete({
		      source: function( request, response ) {
		        $.ajax( {
		          url: OC.generateUrl('/apps/endtoend/nameAutocomplete'),
		          dataType: "json",
		          data: {
		            fileId : fileid,
		            term: request.term
		          },
		          success: function( data ) {
		            response( data );
		
		          }
		        } );
		      },
		      minLength: 2,
		      select: function( event, ui ) {
		        console.log(ui.item.value);
		        var type;
		        var name = ui.item.value.replace("(group)","");
		        if (ui.item.value.includes("(group)") ) {
		            type = "group";
		            $.ajax({	
						url : OC.generateUrl('/apps/endtoend/preShareFile'),
						data :  {
							fileId : fileid,
							sharedWith : name,
							sharedType : "group"
							
						},
						//dataType : 'json',
						type : 'POST',
						success : function(data) {
							if (data.success) {
								port.postMessage({
									type: "shareFile",
									publicKey: data.publicKey,
									sessionKeys: data.sessionKeys,
									sharedWith: name,
									sharedType: 'group',
									groupSecret: data.groupSecret,
									secretiv: data.secretiv,
									fileId: fileid
								});
							}
						},
						async : true
					});
		        } else {
		        	type = "user";
		        	$.ajax({	
						url : OC.generateUrl('/apps/endtoend/preShareFile'),
						data :  {
							fileId : fileid,
							sharedWith : ui.item.value,
							sharedType : "user"
							
						},
						//dataType : 'json',
						type : 'POST',
						success : function(data) {
							if (data.success) {
								port.postMessage({
									type: "shareFile",
									publicKey: data.publicKey,
									sessionKeys: data.sessionKeys,
									sharedWith: ui.item.value,
									sharedType: 'user',
									groupSecret: data.groupSecret,
									secretiv: data.secretiv,
									fileId: fileid
								});
							}
						},
						async : true
					});
		        }
		        var info = "<div style='display:block; padding:4px; border: 1px solid rgb(139, 116, 231);' data-name='" + name +"' data-type='" + type + "'>";
		        info += "<i class='fa fa-lg fa-trash remove-share' style='float:right;'></i>";
		        info += "<div class='avatar'>"+ name[0].toUpperCase() + "</div>";
		        info += ui.item.value;
		        info += filePermissions(31,isFolder);
		        info += "</div>";
		        $("#shared-users").append(info);
		
		      }
		});
		
		
		$( "#addMemberMember" ).autocomplete({
		      source: function( request, response ) {
		        $.ajax( {
		          url: OC.generateUrl('/apps/endtoend/groupUsernameAutoComplete'),
		          dataType: "json",
		          data: {
		            term: request.term,
		            group_id: $( "#addMemberGroup" ).val()
		          },
		          success: function( data ) {
		            response( data );
		
		          }
		        } );
		      },
		      minLength: 2,
		      select: function( event, ui ) {
		     
		      }
		});
		
		$( "#addMemberGroup" ).autocomplete({
		      source: function( request, response ) {
		        $.ajax( {
		          url: OC.generateUrl('/apps/endtoend/groupGroupnameAutoComplete'),
		          dataType: "json",
		          data: {
		            term: request.term
		          },
		          success: function( data ) {
		            response( data );
		
		          }
		        } );
		      },
		      minLength: 2,
		      select: function( event, ui ) {
		     
		      }
		});
		
		$( "#cryptoGroupLeave" ).autocomplete({
		      source: function( request, response ) {
		        $.ajax( {
		          url: OC.generateUrl('/apps/endtoend/groupGroupnameAutoComplete'),
		          dataType: "json",
		          data: {
		            term: request.term
		          },
		          success: function( data ) {
		            response( data );
		
		          }
		        } );
		      },
		      minLength: 2,
		      select: function( event, ui ) {
		     
		      }
		});
		
		$("body").on('click', '.remove-share', function() {
			var that = this;
			$.ajax({    
		        url : OC.generateUrl('/apps/endtoend/unshareFile'),
		        data :  {
		            fileId : fileid,
		            unsharedWith : $(this).parent().data("name"),
		            sharedType: $(this).parent().data("type")
		        },
		        //dataType : 'json',
		        type : 'POST',
		        success : function(data) {
					if(data.success) {
						$(that).parent().remove();
					}
		        },
		        async : true
		    }); 
		});
		
		$("body").on('change', '.changePerm', function() {
		    var result = 1;
		    if ( $("#sharePerm").is(":checked"))
		        result += 16;
		    if ( $("#deletePerm").is(":checked"))
		        result += 8;
		    if ( $("#createPerm").is(":checked"))
		        result += 4;
		    if ( $("#updatePerm").is(":checked"))
		        result += 2;
		    $.ajax({    
		        url : OC.generateUrl('/apps/endtoend/changeShareFile'),
		        data :  {
		            fileId : fileid,
		            sharedWith : $(this).parent().data("name"),
		            type : $(this).parent().data("type"),
		            permissions : result,
		        },
		        //dataType : 'json',
		        type : 'POST',
		        success : function(data) {
		
		        },
		        async : true
		    }); 
		
		});
		
});