var notificationToggled = false;

$(function () {
	console.log('Hello there! <3 https://github.com/Amrykid/HanasuOnline');
	h = $('html').height();
	$('#stations').css("height",h-122);
	$('#settingsPane').tabs();
	if(window.webkitNotifications){
		if (window.webkitNotifications.checkPermission() == 0) {
			$('#notiToggle').html("Disable Notifications");
			notificationToggled = true;
		} else {
			$('#notiToggle').html("Enable Notifications");
			notificationToggled = false;
		}
	}
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
	if (notificationToggled) {
		notificationToggled = false;
		$(this).html("Enable Notifications");
	} else {
		window.webkitNotifications.requestPermission();
		notificationToggled = true;
		$(this).html("Disable Notifications");
	};
});