declare var $;

$(document).ready(function () {
	var hanasu = new Hanasu();
	hanasu.initializeApplication();
	hanasu.loadStations();
});

class Hanasu {
	public IsPlaying: bool;
	private Player: any;
	public Stations: any;
	public initializeApplication() {
		//any important starting procedures, we can put here.
		
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
				$(Hanasu.prototype.Player).jPlayer("setMedia", { mp3: "http://173.192.205.178:80/;stream/1" });
				$(Hanasu.prototype.Player).jPlayer("play");
			}
		});
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
