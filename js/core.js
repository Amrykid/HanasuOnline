$(function () {
	console.log('Hello there! <3 https://github.com/Amrykid/HanasuOnline');
});
var IsPlaying = false;
var Player = "";

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
function initializeApp() {
    //any important starting procedures, we can put here.

    $.getScript("js/jplayer/jquery.jplayer.min.js", function (data, textStatus, jqxhr) {
            $("#jquery_jplayer").jPlayer({
                swfPath: "/js/jplayer",
				solution:"html, flash",
				supplied: "mp3",
				playing: function(e) {
					setPlayStatus(true);
				},
				ended: function(e) {
					setPlayStatus(false);
				},
				error: function(event) {
					alert(event.jPlayer.error.type);
				}
            });
			Player = $("#jquery_jplayer");
        });
	$("#controlPlayPause").click(function() {
		if (IsPlaying) {
			$("#jquery_jplayer").jPlayer("pause");
		} else {
			$("#jquery_jplayer").jPlayer("setMedia", { mp3: "http://174.127.103.99:443/;stream/1" });
            $("#jquery_jplayer").jPlayer("play");
		}
	});
}
function togglePlayStatus() {
	setPlayStatus(!IsPlaying);
}
function setPlayStatus(value) {
	IsPlaying = value;
	$("#controlPlayPause").attr("class", (IsPlaying ? "icon-pause" : "icon-play"));
}
 
		
$(document).ready(function () {
	initializeApp();
});

//notify();