$(function () {
	console.log('Hello there! <3 https://github.com/Amrykid/HanasuOnline');
	h = $('html').height();
	$('#stations').css("height",h-122);
	$('#settingsPane').tabs();
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

var notificationToggled = false;

$('#notiToggle').click(function(){
	if (notificationToggled) {
		notificationToggled = false;
		$(this).html("Enable Notifications");
	} else {
		notificationToggled = true;
		$(this).html("Disable Notifications");
	};
});