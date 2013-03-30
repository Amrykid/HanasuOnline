console.log("HanasuOnline Backend v0.1");
console.log("http://github.com/Amrykid/HanasuOnline");

var playlist = require('./playlist_parser');
var nowplay = require('./nowplaying');
var XML = require('xml-simple');
var fs = require('fs');

var Memcached = require('memcached');
var memcached = new Memcached('127.0.0.1:11211');

var server = require("./server");
server.start(function(path, query, response, callback) {
	switch(path.toLowerCase()) {
		case '/song': {
			// Example: /song?station=XAMFM
			// Returns cached song/artist information for the specified station.
			
			if (query.station != null) { // Guessing.
				console.log('Checking memcached...');
				memcached.get(query.station, function(err, result) {
					if (err) console.error(err); //if theres an error, report it.
					
					if (result == 'undefined' || result == false) {
						// Cache miss. We need to fetch it ourselves.
						console.log('Cache miss. Refreshing cache....');

						var station = null;
						var serverurl = ''; // We may need to get it from /data/Stations.xml ourselves.
						
						fs.readFile('./Stations.xml', function(err, data) {
							XML.parse(data, function(e,parsed) {
								var stations = Object(Object(parsed)["Station"]);
								console.log(stations.length);
								var i = 0;
								while(stations[i] != null) {
									if (stations[i].Name == query.station) {
										station = parsed.Station[i];
										serverurl = station.DataSource;
										break;
									}
									
									i++;
								}
								
								if (station.ExplicitExtension != 'undefined' && station.ServerType == 'Shoutcast') {
									
									var parser_func = null;
									switch(station.ExplicitExtension) {
										case '.pls': {
											parser_func = playlist.get_stream_pls;
											break;
										}
										case '.m3u': {
											break;
										}
									}
									
									parser_func(serverurl, function(stream) {
										serverurl = stream;
										
										try {
											nowplay.get_shoutcast(serverurl, function(title) {
												console.log(title);
												memcached.set(query.station, title, 10, function( err, result ){
													if( err ) console.error( err );
												});
												
												callback(title);
											});
										} catch (ex) {
											console.log(ex);
										}
									});
								} else {
									callback('Unknown - Unknown');
								}
							});
						});
					} else {
						// Hit. We got our cached data, lets send it down the pipe.
						
						console.log('Cache hit: ' + result);
						callback(result);
					}
				});
			}
			
			break;
		}
		case '/playlist': {
			// Example: /playlist?station=XAMFM
			// Returns a cached playlist file for the specified station.
			
		}
	}
});