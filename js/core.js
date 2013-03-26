$(function () {
	console.log('Hello there! <3 https://github.com/Amrykid/HanasuOnline');
});

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