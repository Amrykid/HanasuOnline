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
	private mutedOriginalVolume: any;
	private stationTimer: any;
	
	private currentStationStream: string;
	public CurrentStation: Station;	
	
	public initializeApplication() {
		//any important starting procedures, we can put here.
		
		Hanasu.prototype.muted = false;
		Hanasu.prototype.IsPlaying = false;
		

		//initalize station timer
		Hanasu.prototype.stationTimer = $.timer(function () {
			Hanasu.prototype.retrieveCurrentStationData();
		});
		Hanasu.prototype.stationTimer.set({ time: 10000, autostart: false });
		
		$("#jquery_jplayer").jPlayer({
			swfPath: "js/jplayer",
			solution:"html, flash",
			supplied: "mp3",
			wmode: "window",
			playing: function(e) {
				Hanasu.prototype.setPlayStatus(true);
				if (!Hanasu.prototype.stationTimer.isActive) {
					Hanasu.prototype.stationTimer.play();
				}
			},
			paused: function(e) {
				Hanasu.prototype.setPlayStatus(false); // doesn't work in chrome.
			},
			ended: function(e) {
				Hanasu.prototype.setPlayStatus(false); // doesn't work in chrome.
			},
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
		
		Hanasu.prototype.loadStations(); //loads stations from the local xml.
	}
	
	private loadStations() {
		$.get("data/Stations.xml", function(data) { 
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
			
			//TODO: Remove this line below.
			Hanasu.prototype.CurrentStation = Hanasu.prototype.Stations[4]; //Until we get stations display on the page, pick one for debugging use.
		});
	}
	
	public stopStation() {
		$("#jquery_jplayer").jPlayer("stop");
		Hanasu.prototype.stationTimer.stop();
		Hanasu.prototype.setPlayStatus(false);
		Hanasu.prototype.clearSongInfo();
	}
	
	public playStation(station: Station) {
		if (Hanasu.prototype.IsPlaying) {
			Hanasu.prototype.stopStation();
		}
		
		Hanasu.prototype.obtainNotificationsPermission();
		
		// Checks if the station requires any pre-processing.
		if (station.PlaylistExt == '') {
			Hanasu.prototype._playStation(station, station.Stream); //Plays the station since it is not a playlist, but is a direct stream.
		} else {
			$.get('back/?url=' + encodeURIComponent(station.Stream) + '&callback=?', function(data){
				//Fetches the playlist data and gets ready to parse it.
			
				//Too lazy to implement parser atm. Finds first stream in the playlist and uses that.
				Hanasu.prototype._playStation(station, Hanasu.prototype.getFirstStreamFromStationPlaylist(data, station));
				
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
		
		$(Hanasu.prototype.Player).jPlayer("volume", $("#volumeControl")[0].value / 100); //Sets the volume to what was set by the user before hand.
		$(Hanasu.prototype.Player).jPlayer("setMedia", { mp3: stream }); //Loads the stream.
		$(Hanasu.prototype.Player).jPlayer("play"); //Starts playing the stream.
		
		Hanasu.prototype.CurrentStation = station;
		
		Hanasu.prototype.currentStationStream = stream;
		
		Hanasu.prototype.retrieveCurrentStationData(false); //Grabs the song title and artist name in depending on what the Station ServerType is.
	}
	
	private updateSongInfo(song: string, artist: string, logo: string, notify: bool = true) {
		if ($("#songTitle").html() != song && $("#artistName").html() != artist && notify) {
			Hanasu.prototype.sendSongChangeNotification(song, artist);
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
					var statusSite = Hanasu.prototype.currentStationStream;
					
					statusSite = statusSite.replace(";stream/1", "");
					
					if (!statusSite.endsWith("/")) {
						statusSite += "/";
					}
					statusSite += "7.html";
					statusSite = statusSite.replace(" ", "");
					
					$.get('back/?url=' + encodeURIComponent(statusSite) + '&callback=?', function(data){
						try {
							var title: string = $(data).text().split(",")[6];
							title = title.trim();
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
		$("#controlPlayPause").attr("class", (Hanasu.prototype.IsPlaying ? "icon-pause" : "icon-play"));
		
		Hanasu.prototype.changeVolume($("#volumeControl")[0].value);
	}
	
	public changeVolume(volumeValue) {
		if (volumeValue < 33){
			$('#volumeIcon').attr('class', 'icon-volume-off');
		} else if (volumeValue < 66){
			$('#volumeIcon').attr('class', 'icon-volume-down');
		} else if (volumeValue > 66){
			$('#volumeIcon').attr('class', 'icon-volume-up');
		}
		
		$("#jquery_jplayer").jPlayer("volume", volumeValue / 100);
		
		Hanasu.prototype.muted = volumeValue == 0;
		if (!Hanasu.prototype.muted) {
			Hanasu.prototype.mutedOriginalVolume = volumeValue;
		}
	}
	private toggleVolumeMuted() {
		var volumeControl = $("#volumeControl")[0];
		Hanasu.prototype.muted = !Hanasu.prototype.muted;
	
		if (Hanasu.prototype.muted) {
			Hanasu.prototype.mutedOriginalVolume = volumeControl.value;
			volumeControl.value = 0;
		} else {
			volumeControl.value = Hanasu.prototype.mutedOriginalVolume;
		}
		Hanasu.prototype.changeVolume(volumeControl.value);
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
	
	private obtainNotificationsPermission() {
		if (window.webkitNotifications) {
			if (window.webkitNotifications.checkPermission() == 0) {
				return true;
			} else {
				window.webkitNotifications.requestPermission();
				return false;
			}
		}
		return false;
	}
	private sendNotification(img: string, title: string, body: string) {
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
			notification.show();
			setTimeout(function(){
				notification.close();
			},5000);
		}
	}
	private sendSongChangeNotification(song: string, artist: string) {
		Hanasu.prototype.sendNotification(
			'img/square.png',
			"Song Change",
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