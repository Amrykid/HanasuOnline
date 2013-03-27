$(document).ready(function () {
    var hanasu = new Hanasu();
    hanasu.initializeApplication();
    self.App = hanasu;
});
var Hanasu = (function () {
    function Hanasu() { }
    Hanasu.prototype.initializeApplication = function () {
        Hanasu.prototype.muted = false;
        Hanasu.prototype.IsPlaying = false;
        var stationTimer = $.timer(function () {
            Hanasu.prototype.retrieveCurrentStationData();
        });
        stationTimer.set({
            time: 5000,
            autostart: true
        });
        $("#jquery_jplayer").jPlayer({
            swfPath: "js/jplayer",
            solution: "html, flash",
            supplied: "mp3",
            wmode: "window",
            playing: function (e) {
                Hanasu.prototype.setPlayStatus(true);
            },
            paused: function (e) {
                Hanasu.prototype.setPlayStatus(false);
            },
            ended: function (e) {
                Hanasu.prototype.setPlayStatus(false);
            },
            error: function (event) {
                alert(event.jPlayer.error.type);
            }
        });
        Hanasu.prototype.Player = $("#jquery_jplayer")[0];
        $("#controlPlayPause").click(function () {
            if(Hanasu.prototype.IsPlaying) {
                Hanasu.prototype.stopStation();
            } else {
                if(Hanasu.prototype.CurrentStation == null) {
                } else {
                    Hanasu.prototype.playStation(Hanasu.prototype.CurrentStation);
                }
            }
        });
        $("#volumeIcon").click(Hanasu.prototype.toggleVolumeMuted);
        Hanasu.prototype.loadStations();
    };
    Hanasu.prototype.loadStations = function () {
        $.get("data/Stations.xml", function (data) {
            var $stations = $(data).find("Station");
            Hanasu.prototype.Stations = new Array();
            $stations.each(function () {
                var stat = new Station();
                stat.Name = $(this).find("Name").text();
                stat.Stream = $(this).find("DataSource").text();
                stat.Homepage = $(this).find("Homepage").text();
                stat.PlaylistExt = $(this).find("ExplicitExtension").text();
                stat.ServerType = $(this).find("ServerType").text();
                stat.Logo = $(this).find("Logo").text();
                Hanasu.prototype.Stations[Hanasu.prototype.Stations.length] = stat;
            });
            Hanasu.prototype.CurrentStation = Hanasu.prototype.Stations[4];
        });
    };
    Hanasu.prototype.stopStation = function () {
        $("#jquery_jplayer").jPlayer("stop");
        Hanasu.prototype.setPlayStatus(false);
    };
    Hanasu.prototype.playStation = function (station) {
        if(Hanasu.prototype.IsPlaying) {
            Hanasu.prototype.stopStation();
        }
        if(station.PlaylistExt == '') {
            Hanasu.prototype._playStation(station, station.Stream);
        } else {
            $.get('back/?url=' + encodeURIComponent(station.Stream) + '&callback=?', function (data) {
                Hanasu.prototype._playStation(station, Hanasu.prototype.getFirstStreamFromStationPlaylist(data, station));
            });
        }
    };
    Hanasu.prototype._playStation = function (station, rawStream) {
        var stream = rawStream;
        if(station.ServerType.toLowerCase() == 'shoutcast') {
            if(!stream.endsWith("/")) {
                stream += "/";
            }
            stream += ";stream/1";
        }
        $(Hanasu.prototype.Player).jPlayer("volume", $("#volumeControl")[0].value / 100);
        $(Hanasu.prototype.Player).jPlayer("setMedia", {
            mp3: stream
        });
        $(Hanasu.prototype.Player).jPlayer("play");
        Hanasu.prototype.CurrentStation = station;
        Hanasu.prototype.retrieveCurrentStationData();
    };
    Hanasu.prototype.updateSongInfo = function (song, artist, logo) {
        $("#songTitle").html(song);
        $("#artistName").html(artist);
        $("#coverImg").attr('src', logo);
    };
    Hanasu.prototype.retrieveCurrentStationData = function () {
        if(Hanasu.prototype.CurrentStation != null) {
            switch(Hanasu.prototype.CurrentStation.ServerType.toLowerCase()) {
                case 'shoutcast': {
                    $.get('back/?url=' + encodeURIComponent(Hanasu.prototype.CurrentStation.Stream) + '&callback=?', function (data) {
                        var statusSite = Hanasu.prototype.getFirstStreamFromStationPlaylist(data, Hanasu.prototype.CurrentStation);
                        if(!statusSite.endsWith("/")) {
                            statusSite += "/";
                        }
                        statusSite += "7.html";
                        statusSite = statusSite.replace(" ", "");
                        $.get('back/?url=' + encodeURIComponent(statusSite) + '&callback=?', function (data) {
                            var title = $(data).text().split(",")[6];
                            var titleSplt = title.split(" - ");
                            Hanasu.prototype.updateSongInfo(titleSplt[1], titleSplt[0], Hanasu.prototype.CurrentStation.Logo);
                        });
                    });
                    break;
                }
            }
        }
    };
    Hanasu.prototype.togglePlayStatus = function () {
        Hanasu.prototype.setPlayStatus(!Hanasu.prototype.IsPlaying);
    };
    Hanasu.prototype.setPlayStatus = function (value) {
        Hanasu.prototype.IsPlaying = value;
        $("#controlPlayPause").attr("class", (Hanasu.prototype.IsPlaying ? "icon-pause" : "icon-play"));
        Hanasu.prototype.changeVolume($("#volumeControl")[0].value);
    };
    Hanasu.prototype.changeVolume = function (volumeValue) {
        if(volumeValue < 33) {
            $('#volumeIcon').attr('class', 'icon-volume-off');
        } else if(volumeValue < 66) {
            $('#volumeIcon').attr('class', 'icon-volume-down');
        } else if(volumeValue > 66) {
            $('#volumeIcon').attr('class', 'icon-volume-up');
        }
        $("#jquery_jplayer").jPlayer("volume", volumeValue / 100);
        Hanasu.prototype.muted = volumeValue == 0;
        if(!Hanasu.prototype.muted) {
            Hanasu.prototype.mutedOriginalVolume = volumeValue;
        }
    };
    Hanasu.prototype.toggleVolumeMuted = function () {
        var volumeControl = $("#volumeControl")[0];
        Hanasu.prototype.muted = !Hanasu.prototype.muted;
        if(Hanasu.prototype.muted) {
            Hanasu.prototype.mutedOriginalVolume = volumeControl.value;
            volumeControl.value = 0;
        } else {
            volumeControl.value = Hanasu.prototype.mutedOriginalVolume;
        }
        Hanasu.prototype.changeVolume(volumeControl.value);
    };
    Hanasu.prototype.getFirstStreamFromStationPlaylist = function (data, station) {
        switch(station.PlaylistExt) {
            case '.m3u': {
                var lines = data.split('\n');
                for(var i = 0; i < lines.length; i++) {
                    if(lines[i].startsWith("http")) {
                        return lines[i];
                    }
                }
                return '';
            }
            case '.pls': {
                var lines = data.split('\n');
                for(var i = 0; i < lines.length; i++) {
                    if(lines[i].toLowerCase().startsWith("file1=")) {
                        return lines[i].substring('file1='.length);
                    }
                }
                return '';
            }
        }
    };
    return Hanasu;
})();
var Station = (function () {
    function Station() { }
    return Station;
})();
if(typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}
if(typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
}
