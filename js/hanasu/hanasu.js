var Hanasu = (function () {
    function Hanasu() { }
    Hanasu.prototype.initializeApplication = function () {
        self.IsPlaying = false;
        $.getScript("js/jquery.timer.js", function (data, textStatus, jqxhr) {
            var stationTimer = $.timer(function () {
            });
            stationTimer.set({
                time: 5000,
                autostart: true
            });
        });
        $.getScript("js/jplayer/jquery.jplayer.min.js", function (data, textStatus, jqxhr) {
            $("#jquery_jplayer").jPlayer({
                swfPath: "/js/jplayer",
                solution: "html, flash",
                supplied: "mp3",
                playing: function (e) {
                    setPlayStatus(true);
                },
                paused: function (e) {
                    setPlayStatus(false);
                },
                ended: function (e) {
                    setPlayStatus(false);
                },
                error: function (event) {
                    alert(event.jPlayer.error.type);
                },
                progress: function (e) {
                    alert(e);
                }
            });
            self.Player = $("#jquery_jplayer")[0];
        });
        $("#controlPlayPause").click(function () {
            if(self.IsPlaying) {
                $("#jquery_jplayer").jPlayer("pause");
            } else {
                $("#jquery_jplayer").jPlayer("setMedia", {
                    mp3: "http://174.127.103.99:443/;stream/1"
                });
                $("#jquery_jplayer").jPlayer("play");
            }
        });
    };
    Hanasu.prototype.togglePlayStatus = function () {
        setPlayStatus(!self.IsPlaying);
    };
    Hanasu.prototype.setPlayStatus = function (value) {
        self.IsPlaying = value;
        $("#controlPlayPause").attr("class", (self.IsPlaying ? "icon-pause" : "icon-play"));
    };
    return Hanasu;
})();
$(document).ready(function () {
    var hanasu = new Hanasu();
    hanasu.initializeApplication();
});
