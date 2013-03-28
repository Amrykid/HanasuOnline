$(function () {
	console.log('Hello there! <3 https://github.com/Amrykid/HanasuOnline');
	h = $('html').height();
	$('#stations').css("height",h-122);
	$('#settingsPane').tabs();
	
	setTimeout(function() {
		if(window.webkitNotifications){
			if (window.webkitNotifications.checkPermission() == 0) {
				$('#notiToggle').html("Disable Notifications");
				Hanasu.prototype.NotificationToggled = true;
			} else {
				$('#notiToggle').html("Enable Notifications");
				Hanasu.prototype.NotificationToggled = false;
			}
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

$('.closePane, #settingsButton').click(function(){
	$('#settingsPaneCover').fadeToggle(200);
});

$('#notiToggle').click(function(){
	if (Hanasu.prototype.NotificationToggled) {
		Hanasu.prototype.NotificationToggled = false;
		$(this).html("Enable Notifications");
	} else {
		window.webkitNotifications.requestPermission();
		Hanasu.prototype.NotificationToggled = true;
		$(this).html("Disable Notifications");
	};
});