$(document).ready(function () {
    var hanasu = new Hanasu();
    hanasu.initializeApplication();
    self.App = hanasu;
});
var Hanasu = (function () {
    function Hanasu() { }
    Hanasu.prototype.initializeApplication = function (isMobile) {
        if (typeof isMobile === "undefined") { isMobile = false; }
        Hanasu.prototype.muted = false;
        Hanasu.prototype.IsPlaying = false;
        Hanasu.prototype.PlayerIsReady = false;
        Hanasu.prototype.IsMobile = isMobile;
        Hanasu.prototype.stationTimer = $.timer(function () {
            Hanasu.prototype.retrieveCurrentStationData();
        });
        Hanasu.prototype.stationTimer.set({
            time: 10000,
            autostart: false
        });
        if(!Hanasu.prototype.IsMobile) {
            $("#jquery_jplayer").jPlayer({
                swfPath: "js/jplayer",
                solution: "flash, html",
                supplied: "mp3",
                wmode: "window",
                error: function (event) {
                    switch(event.jPlayer.error.type) {
                        case 'e_url': {
                            alert('Sorry about that. We are unable to connect to that station at this time. Please try again later.');
                            break;
                        }
                        default: {
                            alert(event.jPlayer.error.type);
                            break;
                        }
                    }
                    Hanasu.prototype.setPlayStatus(false);
                    Hanasu.prototype.clearSongInfo();
                }
            });
        } else {
            $("#jquery_jplayer").jPlayer({
                swfPath: "js/jplayer",
                solution: "html, flash",
                supplied: "mp3",
                wmode: "window",
                error: function (event) {
                    Hanasu.prototype.setPlayStatus(false);
                    Hanasu.prototype.clearSongInfo();
                }
            });
        }
        Hanasu.prototype.Player = $("#jquery_jplayer")[0];
        $("#jquery_jplayer").bind($.jPlayer.event.ready, function (event) {
            Hanasu.prototype.handleJPlayerReady();
        });
        $("#jquery_jplayer").bind($.jPlayer.event.play, function (event) {
            Hanasu.prototype.setPlayStatus(true);
            if(!Hanasu.prototype.stationTimer.isActive) {
                Hanasu.prototype.stationTimer.play();
            }
            Hanasu.prototype.retrieveCurrentStationData(false);
        });
        $("#jquery_jplayer").bind($.jPlayer.event.ended, function (event) {
            Hanasu.prototype.setPlayStatus(false);
        });
        $("#jquery_jplayer").bind($.jPlayer.event.pause, function (event) {
            Hanasu.prototype.setPlayStatus(false);
        });
        if(!Hanasu.prototype.IsMobile) {
            $(window).on('beforeunload', function () {
                $("#jquery_jplayer").jPlayer("destroy");
            });
            $("#controlPlayPause").click(function () {
                if(Hanasu.prototype.IsPlaying) {
                    Hanasu.prototype.stopStation();
                } else {
                    if(Hanasu.prototype.CurrentStation == null) {
                    } else {
                    }
                }
            });
            $("#volumeIcon").click(Hanasu.prototype.toggleVolumeMuted);
            $("#volumeControl").change(function () {
                Hanasu.prototype.changeVolume($(this).val());
            });
        } else {
        }
        Hanasu.prototype.loadStations();
    };
    Hanasu.prototype.handleJPlayerReady = function () {
        Hanasu.prototype.PlayerIsReady = true;
    };
    Hanasu.prototype.loadStations = function () {
        $.get("http://" + window.location.hostname + ":8888/stations", function (data) {
            var $stations = $(data).find("Station");
            Hanasu.prototype.Stations = new Array();
            $stations.each(function () {
                var stat = new Station();
                if($(this).has('StationType')) {
                    stat.StationType = $(this).find("StationType").text();
                }
                if(stat.StationType != 'TV') {
                    stat.Name = $(this).find("Name").text();
                    stat.Stream = $(this).find("DataSource").text();
                    stat.Homepage = $(this).find("Homepage").text();
                    stat.PlaylistExt = $(this).find("ExplicitExtension").text();
                    stat.ServerType = $(this).find("ServerType").text();
                    stat.Logo = $(this).find("Logo").text();
                    stat.Format = $(this).find("Format").text();
                    stat.StationType = $(this).find("StationType").text();
                    Hanasu.prototype.Stations[Hanasu.prototype.Stations.length] = stat;
                    var stationHtml = '';
                    if(!Hanasu.prototype.IsMobile) {
                        stationHtml = $("<div></div>");
                        $(stationHtml).attr('class', 'station');
                        $(stationHtml).append("<img src=\"" + stat.Logo + "\">");
                        $(stationHtml).append("<button class=\"favouriteButton icon-heart-empty\"></button>");
                        var titles = $("<div></div>");
                        $(titles).attr('id', 'stationTitles');
                        $(titles).append('<h1>' + stat.Name + '</h1>');
                        $(titles).append('<h2>Play this station.</h2>');
                        $(stationHtml).append(titles);
                        $(stationHtml).click(function () {
                            Hanasu.prototype.playStation(stat);
                        });
                    } else {
                        stationHtml = $('');
                        stationHtml = '<li><a href="javascript:self.App.playStation(self.App.getStationByName(\'' + stat.Name + '\'))">' + stat.Name + '</a></li>';
                        $(stationHtml).click(function () {
                            Hanasu.prototype.playStation(stat);
                        });
                    }
                    $("#stations").append(stationHtml);
                }
            });
            if(Hanasu.prototype.IsMobile) {
                $("#stations").listview('refresh');
            }
        });
    };
    Hanasu.prototype.getStationByName = function (name) {
        for(var i = 0; i < Hanasu.prototype.Stations.length; i++) {
            if(Hanasu.prototype.Stations[i].Name == name) {
                return Hanasu.prototype.Stations[i];
            }
        }
        return null;
    };
    Hanasu.prototype.stopStation = function (clearPlayer) {
        if (typeof clearPlayer === "undefined") { clearPlayer = true; }
        $("#jquery_jplayer").jPlayer("stop");
        Hanasu.prototype.stationTimer.stop();
        Hanasu.prototype.setPlayStatus(false);
        Hanasu.prototype.clearSongInfo();
        Hanasu.prototype.IsPlaying = false;
    };
    Hanasu.prototype.playStation = function (station) {
        if(!Hanasu.prototype.PlayerIsReady) {
            alert("Hold on a sec! We're not done loading yet!");
            return;
        }
        if(Hanasu.prototype.IsPlaying) {
            Hanasu.prototype.stopStation(true);
        }
        Hanasu.prototype.obtainNotificationsPermission();
        if(station.PlaylistExt == '') {
            Hanasu.prototype._playStation(station, station.Stream);
        } else {
            $.get("http://" + window.location.hostname + ":8888/firststream?station=" + station.Name + '&callback=?', function (data) {
                Hanasu.prototype._playStation(station, data);
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
        Hanasu.prototype.CurrentStation = station;
        Hanasu.prototype.currentStationStream = stream;
        $(Hanasu.prototype.Player).jPlayer("clearMedia");
        try  {
            $(Hanasu.prototype.Player).jPlayer("volume", $("#volumeControl")[0].value / 100);
        } catch (ex) {
        }
        if(Hanasu.prototype.muted) {
            $(Hanasu.prototype.Player).jPlayer("mute");
        }
        $(Hanasu.prototype.Player).jPlayer("setMedia", {
            mp3: stream
        }).jPlayer("play");
    };
    Hanasu.prototype.updateSongInfo = function (song, artist, logo, notify) {
        if (typeof notify === "undefined") { notify = true; }
        if($("#songTitle").html() != song && $("#artistName").html() != artist && notify) {
            try  {
                Hanasu.prototype.sendSongChangeNotification(song, artist, Hanasu.prototype.CurrentStation.Logo);
            } catch (e) {
            }
        }
        $("#songTitle").html(song);
        $("#artistName").html(artist);
        $("#coverImg").attr('src', logo);
    };
    Hanasu.prototype.clearSongInfo = function () {
        $("#songTitle").html("Ready");
        $("#artistName").html("and waiting.");
        $("#coverImg").attr('src');
    };
    Hanasu.prototype.retrieveCurrentStationData = function (check) {
        if (typeof check === "undefined") { check = true; }
        if(!Hanasu.prototype.IsPlaying && check) {
            return;
        }
        if(Hanasu.prototype.CurrentStation != null) {
            switch(Hanasu.prototype.CurrentStation.ServerType.toLowerCase()) {
                case 'shoutcast': {
                    $.get("http://" + window.location.hostname + ":8888/song?station=" + Hanasu.prototype.CurrentStation.Name + "&callback=?", function (data) {
                        try  {
                            var title = data.trim();
                            var titleSplt = title.split(" - ");
                            Hanasu.prototype.updateSongInfo(titleSplt[1], titleSplt[0], Hanasu.prototype.CurrentStation.Logo);
                        } catch (e) {
                            Hanasu.prototype.updateSongInfo("N/A", "N/A - Station: " + Hanasu.prototype.CurrentStation.Name, Hanasu.prototype.CurrentStation.Logo, false);
                            Hanasu.prototype.stationTimer.stop();
                        }
                    });
                    break;
                }
                default: {
                    Hanasu.prototype.updateSongInfo("N/A", "N/A - Station: " + Hanasu.prototype.CurrentStation.Name, Hanasu.prototype.CurrentStation.Logo, false);
                    Hanasu.prototype.stationTimer.stop();
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
        $("#controlPlayPause").attr("class", (Hanasu.prototype.IsPlaying ? "icon-stop" : "icon-play"));
        if(!Hanasu.prototype.muted) {
            Hanasu.prototype.changeVolume($("#volumeControl").val());
        }
    };
    Hanasu.prototype.changeVolume = function (volumeValue) {
        if(Hanasu.prototype.PlayerIsReady) {
            $("#jquery_jplayer").jPlayer("volume", volumeValue / 100);
        } else {
            $("#jquery_jplayer").jPlayer({
                ready: function () {
                    $("#jquery_jplayer").jPlayer("volume", volumeValue / 100);
                }
            });
        }
        if(!Hanasu.prototype.muted) {
            if(window.updateVolumeIcon != 'undefined') {
                window.updateVolumeIcon(volumeValue);
            }
        }
    };
    Hanasu.prototype.toggleVolumeMuted = function () {
        Hanasu.prototype.muted = !Hanasu.prototype.muted;
        if(Hanasu.prototype.PlayerIsReady) {
            if(Hanasu.prototype.muted) {
                $(Hanasu.prototype.Player).jPlayer("mute");
            } else {
                $(Hanasu.prototype.Player).jPlayer("unmute");
            }
        } else {
            $("#jquery_jplayer").jPlayer({
                ready: function () {
                    if(Hanasu.prototype.muted) {
                        $(Hanasu.prototype.Player).jPlayer("mute");
                    } else {
                        $(Hanasu.prototype.Player).jPlayer("unmute");
                    }
                }
            });
        }
        window.toggleMuteCallback();
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
            case '.asx': {
                var streams = $(data).find("ref");
                return $(streams[0]).attr('href');
            }
        }
    };
    Hanasu.prototype.obtainNotificationsPermission = function () {
        if(window.webkitNotifications) {
            if(window.webkitNotifications.checkPermission() == 0) {
                Hanasu.prototype.NotificationToggled = true;
                return true;
            } else {
                window.webkitNotifications.requestPermission(function () {
                    Hanasu.prototype.NotificationToggled = window.webkitNotifications.checkPermission() == 0;
                });
                return false;
            }
        } else if(window.Notification) {
            if(window.Notification.permission == 'granted') {
                Hanasu.prototype.NotificationToggled = true;
                return true;
            } else {
                window.Notification.requestPermission(function (perm) {
                    Hanasu.prototype.NotificationToggled = perm == 'granted';
                });
                return false;
            }
        } else if(navigator.mozNotification) {
            return true;
        }
        return false;
    };
    Hanasu.prototype.sendNotification = function (img, title, body) {
        if(Hanasu.prototype.NotificationToggled) {
            if(window.webkitNotifications) {
                if(window.webkitNotifications.checkPermission() == 0) {
                    var notification = window.webkitNotifications.createNotification(img, title, body);
                    notification.onclick = function () {
                        window.focus();
                        notification.close();
                    };
                    notification.ondisplay = function (event) {
                        setTimeout(function () {
                            event.currentTarget.cancel();
                        }, 5000);
                    };
                    notification.show();
                }
            } else if(window.Notification) {
                if(window.Notification.permission == 'granted') {
                    var notification = new Notification(title, {
                        dir: "auto",
                        lang: "",
                        body: body,
                        tag: "sometag"
                    });
                }
            } else if(navigator.mozNotification) {
                var notification = navigator.mozNotification.createNotification(title + body);
                notification.onclick = function () {
                    window.focus();
                };
                notification.show();
            }
        }
    };
    Hanasu.prototype.sendSongChangeNotification = function (song, artist, logo) {
        if (typeof logo === "undefined") { logo = 'img/square.png'; }
        Hanasu.prototype.sendNotification(logo, "Song Update", "'" + song + "' by " + artist);
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
if(typeof String.prototype.trim1 != 'function') {
    String.prototype.trim1 = function (str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}
