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

$('.closePane, #settingsButton').click(function(){
	$('#paneCover, #paneCover .pane').fadeToggle(200);
});

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