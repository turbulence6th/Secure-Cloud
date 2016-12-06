/**
 * ownCloud - endtoend
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Cengaverler <oguz.tanrikulu@metu.edu.tr>
 * @copyright Cengaverler 2016
 */

(function($, OC) {

	$(document).ready(function() {
		
		
		//$('#downloadFile').click(function() {
			//window.location=OC.generateUrl('/apps/endtoend/downloadFile') + "?fileId=" + 
				//$('#tree').treeview('getSelected')[0].fileId;
		//});
		
		$('#deleteFile').click(function() {
			$.ajax({
				url : OC.generateUrl('/apps/endtoend/deleteFile'),
				data : {
					fileId: $('#tree').treeview('getSelected')[0].fileId
				},
				type : 'POST',
				success : function(data) {
					if(data.success){
						refresh();
					}
				}
			});
		});
		
		function refresh() {
			$.ajax({
				url : OC.generateUrl('/apps/endtoend/getFileTree'),
				cache : false,
				contentType : false,
				processData : false,
				type : 'GET',
				success : function(data) {
					$('#tree').treeview({
						data : data,
						showTags: true,
						collapseIcon: "glyphicon glyphicon-folder-open",
						expandIcon: "glyphicon glyphicon-folder-close",
						onNodeSelected: function(event, data) {
						   
						 }
					});
				}
			});
		}
		
		$('#refresh').click(refresh);
		
		refresh();
		
	});

})(jQuery, OC);
