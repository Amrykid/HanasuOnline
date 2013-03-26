declare var $;

$(document).ready(function () {
	var hanasu = new Hanasu();
	hanasu.initializeApplication();
	hanasu.loadStations();

	self.App = hanasu;
});

class Hanasu {
	public IsPlaying: bool;
	private Player: any;
	public Stations: any;
	private muted: bool;
	private mutedOriginalVolume: any;
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
				$("#jquery_jplayer").jPlayer("stop");
				Hanasu.prototype.setPlayStatus(false);
			} else {				
				$(Hanasu.prototype.Player).jPlayer("volume", $("#volumeControl")[0].value / 100);
				$(Hanasu.prototype.Player).jPlayer("setMedia", { mp3: "http://173.192.205.178:80/;stream/1" });
				$(Hanasu.prototype.Player).jPlayer("play");
			}
		});
		
		$("#volumeIcon").click(Hanasu.prototype.toggleVolumeMuted);
	}
	
	public loadStations() {
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
		});
	}
	
	public togglePlayStatus() {
		Hanasu.prototype.setPlayStatus(!Hanasu.prototype.IsPlaying);
	}
	public setPlayStatus(value) {
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
	toggleVolumeMuted() {
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
