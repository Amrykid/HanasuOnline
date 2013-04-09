$(function () {
	console.log('Hello there! <3 https://github.com/Amrykid/HanasuOnline');
	h = $('html').height();
	$('#stations').css("height",h-122);
	$('#settingsPane').tabs();
	
	setTimeout(function() {
		var hanasu = new Hanasu();
		hanasu.initializeApplication();

		self.App = hanasu;
	
		if(window.webkitNotifications) {
			if (window.webkitNotifications.checkPermission() == 0) {
				$('#notiToggle').html("Disable Notifications");
				Hanasu.prototype.NotificationToggled = true;
			} else {
				$('#notiToggle').html("Enable Notifications");
				Hanasu.prototype.NotificationToggled = false;
			}
		} else if (window.Notification) {
			// Firefox Nightly as of time of writing.
			if (window.Notification.permission == 'granted') {
				$('#notiToggle').html("Disable Notifications");
				Hanasu.prototype.NotificationToggled = true;
			} else {
				$('#notiToggle').html("Enable Notifications");
				Hanasu.prototype.NotificationToggled = false;
			}
		} else if (navigator.mozNotification) {
			// Firefox Mobile
			$('#notiToggle').html("Disable Notifications");
			Hanasu.prototype.NotificationToggled = true;
		}
		
	}, 1); //wait for the dom to load.
});

$(window).resize(function(){
	h = $('html').height();
	$('#stations').css('height',h-122);
});

$('#settingsButton').click(function(){
	$('#settingsPane').tabs();
});

$('#faqButton').click(function(){
	$('#paneCover, #faqPane').fadeToggle(200);
});

$('#historyButton').click(function(){
	$('#paneCover, #historyPane').fadeToggle(200);
});

$('#settingsButton').click(function(){
	$('#paneCover, #settingsPane').fadeToggle(200);
});

$('.pane.window > header > .closePane, .pane.window .dialogButton').click(function(){
	$('.pane.window').fadeOut(200);
	
	if ($('.dialog.closeable').is(":visible") || $('.dialog.noncloseable').is(":visible")) {
		// a dialog is open. don't close the pane.
	} else {
		$('#paneCover').fadeOut(200);
	}
});
$('.dialog > header > .closePane, .dialog .dialogButton').click(function(){
	$('.dialog').fadeOut(200);
	
	if ($('.pane.window').is(":visible")) {
		// a dialog is open. don't close the pane.
	} else {
		$('#paneCover').fadeOut(200);
	}
});

$(".pane.window").draggable({ containment: $(document.body), scroll: false , opacity: 0.35}); //http://api.jqueryui.com/draggable/#option-containment

function dialog(title,message){
	$('.dialog.closeable > header h1').html(title);
	$('.dialog.closeable > p').html(message);
	$('#paneCover, .dialog.closeable').fadeIn(200);
}
function non_close_dialog(title,message){
	$('.dialog.noncloseable > header h1').html(title);
	$('.dialog.noncloseable > p').html(message);
	$('#paneCover, .dialog.noncloseable').fadeIn(200);
	
	return function() { 
		if ($('.pane.window').is(":visible")) {
			// a window is open. don't close the pane.
		} else {
			$('#paneCover').fadeOut(200);
		}
		$('.dialog.noncloseable').fadeOut(200);
	};
}

$('#notiToggle').click(function(){
	if (Hanasu.prototype.NotificationToggled) {
		Hanasu.prototype.NotificationToggled = false;
		$(this).html("Enable Notifications");
	} else {
		Hanasu.prototype.obtainNotificationsPermission();
		Hanasu.prototype.NotificationToggled = true;
		$(this).html("Disable Notifications");
	};
});

window.updateVolumeIcon = updateVolumeIcon;
function updateVolumeIcon(volumeValue) {
	if (volumeValue == 0) {
		$('#volumeIcon').attr('class', 'icon-remove-sign');
	} else if (volumeValue < 33){
		$('#volumeIcon').attr('class', 'icon-volume-off');
	} else if (volumeValue < 66){
		$('#volumeIcon').attr('class', 'icon-volume-down');
	} else if (volumeValue >= 66){
		$('#volumeIcon').attr('class', 'icon-volume-up');
	}
}

window.toggleMuteCallback = toggleMuteCallback;
function toggleMuteCallback() {
	if (Hanasu.prototype.muted) {
		$('#volumeIcon').attr('class', 'icon-remove-sign');
	} else {
		updateVolumeIcon($("#volumeControl").val());
	}
}

function onHanasuInitialized() {
	$(".station").click(function() {
		$(this).effect("shake", {direction: "up"}); 
	});
}

$("input[type='search']").on('search', function () {
	//http://stackoverflow.com/questions/2977023/how-do-you-detect-the-clearing-of-a-search-html5-input
	var query = $(this).val();
	$("#stations").empty();

	if (query == '') {
		$(Hanasu.prototype.Stations).each(function() {
			Hanasu.prototype.addStationToUI(this);
		});
	} else {
		var searched = $(Hanasu.prototype.Stations).filter(function(index) {
			return this.Name.toLowerCase().indexOf(query.toLowerCase()) !== -1; // http://stackoverflow.com/questions/1789945/method-like-string-contains-in-javascript
		});
		searched.each(function() {
			Hanasu.prototype.addStationToUI(this);
		});
		
		if (searched.length == 1) {
			Hanasu.prototype.playStation(searched[0]);
		}
	}
	
	$(".station").click(function() {
		$(this).effect("shake", {direction: "up"}); 
	});
});

$("#nowplaying").effect("slide").promise().done(function() { $(this).hide(); });
$("#leftPageArrow").hide();

$("#leftPageArrow, #rightPageArrow").click(function() {
	$(this).hide();
	
	if (this.id == "leftPageArrow") {
		$("#nowplaying").toggle("slide", { direction: "left"}).promise().done(function() {
			$(this).hide();
			$("#stations").toggle("slide", { direction: "right"});
			$("#rightPageArrow").show();
		});
	} else {
		$("#stations").toggle("slide", { direction: "right"}).promise().done(function() {
			$(this).hide();
			$("#nowplaying").toggle("slide", { direction: "left"});
			$("#leftPageArrow").show();
		});
	}
});
