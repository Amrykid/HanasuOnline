/* 
	HanasuOnline 0.1
	
	Authors:
		Amrykid (https://github.com/Amrykid)
		Madison Tries (https://github.com/Phalanxia or http://twitter.com/madisontries)
		JStoker (https://github.com/jstoker)
*/


declare var $;

$(document).ready(function () {
	var hanasu = new Hanasu();
	hanasu.initializeApplication();

	self.App = hanasu;
});

// main Application class.
class Hanasu {
	public IsPlaying: bool;
	private Player: any;
	public Stations: any;
	private muted: bool;
	private stationTimer: any;
	private PlayerIsReady: bool;
	
	private currentStationStream: string;
	public CurrentStation: Station;	
	public NotificationToggled: bool;
	
	public initializeApplication() {
		//any important starting procedures, we can put here.
		
		Hanasu.prototype.muted = false;
		Hanasu.prototype.IsPlaying = false;
		Hanasu.prototype.PlayerIsReady = false;

		//initalize station timer
		Hanasu.prototype.stationTimer = $.timer(function () {
			Hanasu.prototype.retrieveCurrentStationData();
		});
		Hanasu.prototype.stationTimer.set({ time: 10000, autostart: false });
		
		$("#jquery_jplayer").jPlayer({
			swfPath: "js/jplayer",
			solution:"flash, html",
			supplied: "mp3",
			wmode: "window",
			error: function(event) {
				switch(event.jPlayer.error.type)
				{
					case 'e_url':
					{
						alert('Sorry about that. We are unable to connect to that station at this time. Please try again later.');
						break;
					}
					default:
					{
						alert(event.jPlayer.error.type);
						break;
					}
				}
				
				Hanasu.prototype.setPlayStatus(false);
				Hanasu.prototype.clearSongInfo();
			}
		});
		Hanasu.prototype.Player = $("#jquery_jplayer")[0];
		
		$("#jquery_jplayer").bind($.jPlayer.event.ready, function(event) {
			Hanasu.prototype.handleJPlayerReady();
		});
		
		$("#jquery_jplayer").bind($.jPlayer.event.play, function(event) {
			Hanasu.prototype.setPlayStatus(true);
			if (!Hanasu.prototype.stationTimer.isActive) {
				Hanasu.prototype.stationTimer.play();
			}
			
			Hanasu.prototype.retrieveCurrentStationData(false); //Grabs the song title and artist name in depending on what the Station ServerType is.
		});
		
		$("#jquery_jplayer").bind($.jPlayer.event.ended, function(event) {
			Hanasu.prototype.setPlayStatus(false); // doesn't work in chrome.
		});
		$("#jquery_jplayer").bind($.jPlayer.event.pause, function(event) {
			Hanasu.prototype.setPlayStatus(false); // doesn't work in chrome.
		});
						
				
		//handles when the play/pause button is clicked.
		$("#controlPlayPause").click(function() {
			if (Hanasu.prototype.IsPlaying) {
				Hanasu.prototype.stopStation(); //stops playing the station if it is already in progress.
			} else {			
				if (Hanasu.prototype.CurrentStation == null) {
				} else {
					Hanasu.prototype.playStation(Hanasu.prototype.CurrentStation); // plays the last played station.
				}
			}
		});

		$("#volumeIcon").click(Hanasu.prototype.toggleVolumeMuted); //handles when the volume icon is clicked.
		$("#volumeControl").change(function() {
			Hanasu.prototype.changeVolume($(this).val());
		});
		
		Hanasu.prototype.loadStations(); //loads stations from the local xml.
	}
	
	private handleJPlayerReady() {
		Hanasu.prototype.PlayerIsReady = true;
	}
	
	private loadStations() {
		$.get("http://" + window.location.hostname + ":8888/stations", function(data) { 
			//fetches the xml that contains all of the stations.
			var $stations = $(data).find("Station");
			
			Hanasu.prototype.Stations = new Station[]; //creates an array to store the stations for later use.
			
			//iterates all of the <Station> xml nodes, building a Station object for each.
			$stations.each(function() {
				var stat = new Station();
				
				if ($(this).has('StationType')) {
					stat.StationType = $(this).find("StationType").text();
				}
				
				if (stat.StationType != 'TV') {
					stat.Name = $(this).find("Name").text();
					stat.Stream = $(this).find("DataSource").text();
					stat.Homepage = $(this).find("Homepage").text();
					stat.PlaylistExt = $(this).find("ExplicitExtension").text();
					stat.ServerType = $(this).find("ServerType").text();
					stat.Logo = $(this).find("Logo").text();
					stat.Format = $(this).find("Format").text();
					stat.StationType = $(this).find("StationType").text();
					
					Hanasu.prototype.Stations[Hanasu.prototype.Stations.length] = stat; //Adds the Station object to the Stations array.
					
					var stationHtml = $("<div></div>");
					$(stationHtml).attr('class', 'station');
					$(stationHtml).append("<img src=\"" + stat.Logo + "\">");
					$(stationHtml).append("<button class=\"favouriteButton icon-heart-empty\"></button>");
					
					var titles = $("<div></div>");
					$(titles).attr('id', 'stationTitles');
					$(titles).append('<h1>' + stat.Name + '</h1>');
					$(titles).append('<h2>Play this station.</h2>'); //May be changed in the future to a station slogan.
					
					
					$(stationHtml).append(titles);
					
					$(stationHtml).click(function() {
						Hanasu.prototype.playStation(stat);
					});
					
					$("#stations").append(stationHtml);
				}
				
			});
			
		});
	}
	
	public stopStation(clearPlayer: bool = true) {
		$("#jquery_jplayer").jPlayer("stop");
		Hanasu.prototype.stationTimer.stop();
		Hanasu.prototype.setPlayStatus(false);
		Hanasu.prototype.clearSongInfo();
		
		Hanasu.prototype.IsPlaying = false;
	}
	
	public playStation(station: Station) {
		if (!Hanasu.prototype.PlayerIsReady) {
			alert("Hold on a sec! We're not done loading yet!");
			return;
		}
	
		if (Hanasu.prototype.IsPlaying) {
			Hanasu.prototype.stopStation(true);
		}
		
		Hanasu.prototype.obtainNotificationsPermission();
		
		// Checks if the station requires any pre-processing.
		if (station.PlaylistExt == '') {
			Hanasu.prototype._playStation(station, station.Stream); //Plays the station since it is not a playlist, but is a direct stream.
		} else {
			$.get("http://" + window.location.hostname + ":8888/firststream?station=" + station.Name + '&callback=?', function(data){
				//Fetches the playlist data and gets ready to parse it.
			
				//Too lazy to implement parser atm. Finds first stream in the playlist and uses that.
				Hanasu.prototype._playStation(station, data);
				
			});
		}
	}
	private _playStation(station: Station, rawStream: string) {
		//Callback function. Use playStation instead.
		
		var stream = rawStream;
		
		//If the station is a Shoutcast/Icecast station, construct the direct link to the audio stream.
		if (station.ServerType.toLowerCase() == 'shoutcast') {
			if (!stream.endsWith("/")) {
				stream += "/";
			}
			stream += ";stream/1";
		}
		
		Hanasu.prototype.CurrentStation = station;
		
		Hanasu.prototype.currentStationStream = stream;
		
		$(Hanasu.prototype.Player).jPlayer("clearMedia");
		
		$(Hanasu.prototype.Player).jPlayer("volume", $("#volumeControl")[0].value / 100); //Sets the volume to what was set by the user before hand.
		if (Hanasu.prototype.muted) {
			$(Hanasu.prototype.Player).jPlayer("mute")
		}
		$(Hanasu.prototype.Player).jPlayer("setMedia", { mp3: stream }) //Loads the stream.
			.jPlayer("play"); //Starts playing the stream.
	}
	
	private updateSongInfo(song: string, artist: string, logo: string, notify: bool = true) {
		if ($("#songTitle").html() != song && $("#artistName").html() != artist && notify) {
			try {
				Hanasu.prototype.sendSongChangeNotification(song, artist, Hanasu.prototype.CurrentStation.Logo);
			} catch (e) {
			}
		}
	
		$("#songTitle").html(song);
		$("#artistName").html(artist);
		$("#coverImg").attr('src', logo);
	}
	private clearSongInfo() {
		$("#songTitle").html("Ready");
		$("#artistName").html("and waiting.");
		$("#coverImg").attr('src');
	}
	
	private retrieveCurrentStationData(check: bool = true) {
		if (!Hanasu.prototype.IsPlaying && check) return;
	
		if (Hanasu.prototype.CurrentStation != null) {
			switch(Hanasu.prototype.CurrentStation.ServerType.toLowerCase())
			{
				case 'shoutcast':
				{	
					$.get("http://" + window.location.hostname + ":8888/song?station=" + Hanasu.prototype.CurrentStation.Name + "&callback=?", function(data){
						try {
							var title: string = data.trim();
							var titleSplt = title.split(" - ");
							
							Hanasu.prototype.updateSongInfo(titleSplt[1], titleSplt[0], Hanasu.prototype.CurrentStation.Logo);
						} catch (e) {
							Hanasu.prototype.updateSongInfo("N/A", "N/A - Station: " + Hanasu.prototype.CurrentStation.Name, Hanasu.prototype.CurrentStation.Logo, false);
							Hanasu.prototype.stationTimer.stop();
						}
					});
					break;
				}
				default:
				{
					Hanasu.prototype.updateSongInfo("N/A", "N/A - Station: " + Hanasu.prototype.CurrentStation.Name, Hanasu.prototype.CurrentStation.Logo, false);
					Hanasu.prototype.stationTimer.stop();
					break;
				}
			}
		}
	}
	
	private togglePlayStatus() {
		Hanasu.prototype.setPlayStatus(!Hanasu.prototype.IsPlaying);
	}
	private setPlayStatus(value) {
		Hanasu.prototype.IsPlaying = value;
		$("#controlPlayPause").attr("class", (Hanasu.prototype.IsPlaying ? "icon-stop" : "icon-play"));
		
		if (!Hanasu.prototype.muted) {
			Hanasu.prototype.changeVolume($("#volumeControl").val());
		}
	}
	
	public changeVolume(volumeValue) {
		if (Hanasu.prototype.PlayerIsReady) {
			$("#jquery_jplayer").jPlayer("volume", volumeValue / 100);
		} else {
			$("#jquery_jplayer").jPlayer({ ready: function() {
				$("#jquery_jplayer").jPlayer("volume", volumeValue / 100);
			}});
		}
		if (!Hanasu.prototype.muted) {
			window.updateVolumeIcon(volumeValue);
		}
	}
	private toggleVolumeMuted() {
		Hanasu.prototype.muted = !Hanasu.prototype.muted;
		
		if (Hanasu.prototype.PlayerIsReady) {
			if (Hanasu.prototype.muted) {
				$(Hanasu.prototype.Player).jPlayer("mute")
			} else {
				$(Hanasu.prototype.Player).jPlayer("unmute")
			}
		} else {
			$("#jquery_jplayer").jPlayer({ ready: function() {
				if (Hanasu.prototype.muted) {
					$(Hanasu.prototype.Player).jPlayer("mute")
				} else {
					$(Hanasu.prototype.Player).jPlayer("unmute")
				}
			}});
		}
		window.toggleMuteCallback();
	 }
	 
	private getFirstStreamFromStationPlaylist(data: string, station: Station) {
		switch(station.PlaylistExt)
		{
			case '.m3u':
			{
				var lines = data.split('\n');
				for(var i = 0; i < lines.length; i++) {
					if (lines[i].startsWith("http")) {
						return lines[i];
					}
				}
				return '';
			}
			case '.pls':
			{
				var lines = data.split('\n');
				for(var i = 0; i < lines.length; i++) {
					if (lines[i].toLowerCase().startsWith("file1=")) {
						return lines[i].substring('file1='.length);
					}
				}
				return '';
			}
			case '.asx':
			{
				var streams = $(data).find("ref");
				return $(streams[0]).attr('href');
			}
		}
	 }
	
	public obtainNotificationsPermission() {
		if (window.webkitNotifications) {
			if (window.webkitNotifications.checkPermission() == 0) {
				Hanasu.prototype.NotificationToggled = true;
				return true;
			} else {
				window.webkitNotifications.requestPermission(function() {
					Hanasu.prototype.NotificationToggled = window.webkitNotifications.checkPermission() == 0;
				});
				return false;
			}
		} else if (window.Notification) {
			// Firefox Nightly as of time of writing.
			if (window.Notification.permission == 'granted') {
				Hanasu.prototype.NotificationToggled = true;
				return true;
			} else {
				window.Notification.requestPermission(function(perm) {
					Hanasu.prototype.NotificationToggled = perm == 'granted';
				});
				return false;
			}
		} else if (navigator.mozNotification) {
			// Firefox Mobile
			return true;
		}
		return false;
	}
	private sendNotification(img: string, title: string, body: string) {
		if (Hanasu.prototype.NotificationToggled) {
			if (window.webkitNotifications) {
				if (window.webkitNotifications.checkPermission() == 0) {
					var notification = window.webkitNotifications.createNotification(
						img,
						title,
						body
					);
					notification.onclick = function () {
						window.focus();
						notification.close();
					}
					notification.ondisplay = function (event) {
						setTimeout(function() {
							event.currentTarget.cancel();
						}, 5000);
					}
					notification.show();
				}
			} else if (window.Notification) {
				//FF Nightly at the time of writing. May change.
				if (window.Notification.permission == 'granted') {
					var notification = new Notification(title, {
						dir: "auto",
						lang: "",
						body: body,
						tag: "sometag",
				  });
				}
			} else if (navigator.mozNotification) {
				// Firefox Mobile
				var notification = navigator.mozNotification.createNotification(
					title +
					body);
				notification.onclick = function () {
					window.focus();
					// notification.close(); Auto closed.
				};
				
				notification.show();
			}
			
		}
	}
	private sendSongChangeNotification(song: string, artist: string, logo: string = 'img/square.png') {
		Hanasu.prototype.sendNotification(
			logo,
			"Song Update",
			"'" + song + "' by " + artist);
	}
}

class Station {
	public Name: string;
	public Stream: string;
	public Homepage: string;
	public PlaylistExt: string; //maps to 'ExplicitExtension' in xml
	public ServerType: string;
	public Logo: string;
	public Format: string;
	public StationType: string;
}

/* helper functions from http://stackoverflow.com/questions/646628/javascript-startswith */
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}
if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}
/* ---------------------------------------- */

if (typeof String.prototype.trim1 != 'function') {
  String.prototype.trim1 = function(str: string) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); //http://stackoverflow.com/questions/3000649/trim-spaces-from-start-and-end-of-string
  };
}