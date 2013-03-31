console.log("HanasuOnline Backend v0.1.4");
console.log("http://github.com/Amrykid/HanasuOnline");

var playlist = require('./playlist_parser');
var nowplay = require('./nowplaying');
var XML = require('xml-simple');
var fs = require('fs');

var Memcached = require('memcached');
var memcached = new Memcached('127.0.0.1:11211');

var server = require("./server");
server.start(function(path, query, response, callback) {
	console.log('REQUESTED: ' + path);
	switch(path.toLowerCase()) {
		case '/song': {
			// Example: /song?station=XAMFM
			// Returns cached song/artist information for the specified station.
			var requestedStation = query.station.replace(' ','_');
			
			if (query.station != null) { // Guessing.
				console.log('Checking memcached...');
				memcached.get(requestedStation, function(err, result) {
					if (err) console.error(err); //if theres an error, report it.
					
					if (result == 'undefined' || result == false) {
						// Cache miss. We need to fetch it ourselves.
						console.log('Cache miss. Refreshing cache....');
						try {
							getStation(query.station, function(station, serverurl) {
								console.log("Got station: " + station.Name);
								if (station.ExplicitExtension != 'undefined' && station.ServerType == 'Shoutcast') {
									
									var parser_func = null;
									switch(station.ExplicitExtension) {
										case '.pls': {
											parser_func = playlist.get_stream_pls;
											break;
										}
										case '.m3u': {
											parser_func = playlist.get_stream_m3u;
											break;
										}
										case '.asx': {
											parser_func = playlist.get_stream_asx;
										}
									}
									
									parser_func(serverurl, function(stream) {
										serverurl = stream;
										console.log('Resolved stream url: ' + stream);
										try {
											nowplay.get_shoutcast(serverurl, function(title) {
												console.log(title);
												memcached.set(requestedStation, title, 12, function( err, result ){
													if( err ) console.error( err );
												});
												
												callback(title, true);
											});
										} catch (ex) {
											console.log(ex);
										}
									});
								} else {
									callback('Unknown - Unknown', true);
								}
							});
						} catch (e) {
							callback('Unknown - Unknown', true);
						}
					} else {
						// Hit. We got our cached data, lets send it down the pipe.
						
						console.log('Cache hit: ' + result);
						callback(result, true);
					}
				});
			}
			
			break;
		}
		case '/playlist': {
			// Example: /playlist?station=XAMFM
			// Returns a cached playlist file for the specified station.
			callback('', false);
			break;
		}
		case '/stations': {
			memcached.get("_stations", function(err, result) {
				if (err) console.error(err); //if theres an error, report it.
				
				if (result == 'undefined' || result == false) {
					fs.readFile('./Stations.xml', function(err, data) {
						memcached.set("_stations", data, 3600 * 5, function( err, result ){
							if( err ) console.error( err );
						});
					
						callback(data, true);
					});
				} else {
					callback(result, true);
				}
			});
			break;
		}
		case '/firststream': {
			// Example: /firststream?station=XAMFM
			
			if (query.station != null) {
				getStation(query.station, function(station, serverurl) {
					if (station.ExplicitExtension != 'undefined' && station.ServerType == 'Shoutcast') {			
						var parser_func = null;
						switch(station.ExplicitExtension) {
							case '.pls': {
								parser_func = playlist.get_stream_pls;
								break;
							}
							case '.m3u': {
								parser_func = playlist.get_stream_m3u;
								break;
							}
						}
						
						parser_func(serverurl, function(stream) {
							callback(stream, true);
						});
					}
				});
			} else {
				callback('', false);
			}
			break;
		}
		case '/favicon.ico': {
			callback('', false);
			break;
		}
	}
});
function getStation(name, callback) {
	var station = null;
	var serverurl = '';
	fs.readFile('./Stations.xml', function(err, data) {
		XML.parse(data, function(e,parsed) {
			var stations = Object(Object(parsed)["Station"]);
			console.log(stations.length);
			var i = 0;
			while(stations[i] != null) {
				if (stations[i].Name == name) {
					station = parsed.Station[i];
					serverurl = station.DataSource;
					break;
				}
				
				i++;
			}
			callback(station, serverurl);
		});
	});
}