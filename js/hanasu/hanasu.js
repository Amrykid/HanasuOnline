var Hanasu = (function () {
    function Hanasu() { }
    Hanasu.prototype.initializeApplication = function () {
        Hanasu.prototype.muted = false;
        Hanasu.prototype.IsPlaying = false;
        var stationTimer = $.timer(function () {
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
                $("#jquery_jplayer").jPlayer("stop");
                Hanasu.prototype.setPlayStatus(false);
            } else {
                $(Hanasu.prototype.Player).jPlayer("setMedia", {
                    mp3: "http://173.192.205.178:80/;stream/1"
                });
                $(Hanasu.prototype.Player).jPlayer("play");
            }
        });
    };
    Hanasu.prototype.togglePlayStatus = function () {
        Hanasu.prototype.setPlayStatus(!Hanasu.prototype.IsPlaying);
    };
    Hanasu.prototype.setPlayStatus = function (value) {
        Hanasu.prototype.IsPlaying = value;
        $("#controlPlayPause").attr("class", (Hanasu.prototype.IsPlaying ? "icon-pause" : "icon-play"));
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
    return Hanasu;
})();
$(document).ready(function () {
    var hanasu = new Hanasu();
    hanasu.initializeApplication();
    self.App = hanasu;
});
