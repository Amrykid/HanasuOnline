declare var $;

$(document).ready(function () {
	var hanasu = new Hanasu();
	hanasu.initializeApplication();

	self.App = hanasu;
});

class Hanasu {
	public IsPlaying: bool;
	private Player: any;
	public Stations: any;
	private muted: bool;
	private mutedOriginalVolume: any;
	
	public CurrentStation: Station;
	
	public initializeApplication() {
		//any important starting procedures, we can put here.
		
		Hanasu.prototype.muted = false;
		Hanasu.prototype.IsPlaying = false;
		

		//initalize station timer
		var stationTimer = $.timer(function () {
			
		});
		stationTimer.set({ time: 5000, autostart: true });
		
		$("#jquery_jplayer").jPlayer({
			swfPath: "js/jplayer",
			solution:"html, flash",
			supplied: "mp3",
			wmode: "window",
			playing: function(e) {
				Hanasu.prototype.setPlayStatus(true);
			},
			paused: function(e) {
				Hanasu.prototype.setPlayStatus(false); // doesn't work in chrome.
			},
			ended: function(e) {
				Hanasu.prototype.setPlayStatus(false); // doesn't work in chrome
			},
			error: function(event) {
				alert(event.jPlayer.error.type);
			}
		});
		Hanasu.prototype.Player = $("#jquery_jplayer")[0];
				
		$("#controlPlayPause").click(function() {
			if (Hanasu.prototype.IsPlaying) {
				Hanasu.prototype.stopStation();
			} else {			
				if (Hanasu.prototype.CurrentStation == null) {
				} else {
					Hanasu.prototype.playStation(Hanasu.prototype.CurrentStation);
				}
			}
		});
		
		$("#volumeIcon").click(Hanasu.prototype.toggleVolumeMuted);
		
		Hanasu.prototype.loadStations();
	}
	
	private loadStations() {
		$.get("data/Stations.xml", function(data) {
			var $stations = $(data).find("Station");
			
			Hanasu.prototype.Stations = new Station[];
			
			$stations.each(function() {
				var stat = new Station();
				stat.Name = $(this).find("Name").text();
				stat.Stream = $(this).find("DataSource").text();
				stat.Homepage = $(this).find("Homepage").text();
				stat.PlaylistExt = $(this).find("ExplicitExtension").text();
				stat.ServerType = $(this).find("ServerType").text();
				stat.Logo = $(this).find("Logo").text();
				
				Hanasu.prototype.Stations[Hanasu.prototype.Stations.length] = stat;
			});
			
			//TODO: Remove this line below.
			Hanasu.prototype.CurrentStation = Hanasu.prototype.Stations[4];
		});
	}
	
	public stopStation() {
		$("#jquery_jplayer").jPlayer("stop");
		Hanasu.prototype.setPlayStatus(false);
	}
	
	public playStation(station: Station) {
		if (Hanasu.prototype.IsPlaying) {
			Hanasu.prototype.stopStation();
		}
		
		if (station.PlaylistExt == '') {
			Hanasu.prototype._playStation(station, station.Stream);
		} else {
			$.get('back/?url=' + encodeURIComponent(station.Stream) + '&callback=?', function(data){
				//to lazy to implement parser atm.
				
				switch(station.PlaylistExt)
				{
					case '.m3u':
					{
						var lines = data.split('\n');
						for(var i = 0; i < lines.length; i++) {
							if (lines[i].startsWith("http")) {
								Hanasu.prototype._playStation(station, lines[i]);
								break;
							}
						}
						break;
					}
					case '.pls':
					{
						var lines = data.split('\n');
						for(var i = 0; i < lines.length; i++) {
							if (lines[i].toLowerCase().startsWith("file1=")) {
								Hanasu.prototype._playStation(station, lines[i].substring('file1='.length));
								break;
							}
						}
						break;
					}
				}
			});
		}
	}
	private _playStation(station: Station, rawStream: string) {
		//callback function. use playStation instead.
		
		var stream = rawStream;
		
		if (station.ServerType.toLowerCase() == 'shoutcast') {
			if (!stream.endsWith("/")) {
				stream += "/";
			}
			stream += ";stream/1";
		}
		
		$(Hanasu.prototype.Player).jPlayer("volume", $("#volumeControl")[0].value / 100);
		$(Hanasu.prototype.Player).jPlayer("setMedia", { mp3: stream });
		$(Hanasu.prototype.Player).jPlayer("play");
		
		Hanasu.prototype.CurrentStation = station;
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
}

class Station {
	public Name: string;
	public Stream: string;
	public Homepage: string;
	public PlaylistExt: string; //maps to 'ExplicitExtension' in xml
	public ServerType: string;
	public Logo: string;
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