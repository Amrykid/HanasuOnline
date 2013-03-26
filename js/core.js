$(function () {
	console.log('Hello there! <3 https://github.com/Amrykid/HanasuOnline');
});

function changeVolume(volumeValue){
	if (volumeValue < 33){
		$('#volumeIcon').attr('class', 'icon-volume-off');
	} else if (volumeValue < 66){
		$('#volumeIcon').attr('class', 'icon-volume-down');
	} else if (volumeValue > 66){
		$('#volumeIcon').attr('class', 'icon-volume-up');
	}
	
	$("#jquery_jplayer").jPlayer("volume", volumeValue / 100);
}

function notify() {
	var havePermission = window.webkitNotifications.checkPermission();
	if (havePermission == 0) {
		var notification = window.webkitNotifications.createNotification(
		'img/square.png',
		'Song Title',
		'Artist Name'
		);
		notification.onclick = function () {
			window.focus();
			notification.close();
		}
		notification.show();
		setTimeout(function(){
			notification.close();
		},5000);
	} else {
		window.webkitNotifications.requestPermission();
	}
}
 
//notify();