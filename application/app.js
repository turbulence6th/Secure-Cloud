$( document ).ready(function() {
    $('.list-group-item').click(function(){
		var tabname = $(this).data("tab-name");
		$(".tabpanel").removeClass("visible");
		$(".tabpanel").addClass("hidden");
		$("#"+tabname).toggleClass("hidden visible");
		$(".list-group-item").removeClass("active");
		$(this).addClass("active"); 
	});

	$("#goImport").click( function() {
		$(".tabpanel").removeClass("visible");
		$(".tabpanel").addClass("hidden");
		$("#importKeys").toggleClass("hidden visible");
		$(".list-group-item").removeClass("active");
		$("a[data-tab-name='importKeys']").addClass("active"); 
	});	

	$("#goGenerate").click( function() {
		$(".tabpanel").removeClass("visible");
		$(".tabpanel").addClass("hidden");
		$("#generateKeys").toggleClass("hidden visible");
		$(".list-group-item").removeClass("active");
		$("a[data-tab-name='generateKeys']").addClass("active"); 
	});	

	$("#clear-textarea").click( function() {
		$("textarea").val("");
	});
	$("#clear-input").click( function() {
		$("input").val("");
	});
	$("#choose-key-button").click(function() {
		var value = $("input[type='radio'][name='choose-key']:checked").val();
		var url = $(this).val();
		console.log("Chosen key: " + value);
		chooseKey(url, value);
	});

	$("#import-key").click( function() {
		var publicKey = $("#publicKey").val();
		var privateKey = $("#privateKey").val();
		import_key(publicKey,privateKey);
	});

	$("#generate-key").click( function() {
		var keyname = $("#keyname").val();
		var algo = $("#algo").val();
		generate_key(keyname,algo);

	});

});



