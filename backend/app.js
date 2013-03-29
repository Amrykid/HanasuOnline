console.log("HanasuOnline Backend v0.1");
console.log("http://github.com/Amrykid/HanasuOnline");

var nowplay = require('./nowplaying');

var Memcached = require('memcached');
var memcached = new Memcached('server:port');

var server = require("./server");
server.start(function(path, query, response) {
	switch(path.toLowerCase()) {
		case '/song': {
			// Example: /song?station=XAMFM
			// Returns cached song/artist information for the specified station.
			
			if (query.contains('station')) { // Guessing.
				memcached.get(query['station'], 1, 10000, function(err, result) {
					if (err) console.error(err); //if theres an error, report it.
					
					if (result == 'undefined') {
						// Cache miss. We need to fetch it ourselves.
						
						var serverurl = ''; // We may need to get it from /data/Stations.xml ourselves.
						
						nowplay.get_shoutcast(serverurl, function(title) {
							memcached.set(query['station'], 1, 10000, function( err, result ){
								if( err ) console.error( err );
							});
							
							response.write(title);
						});
					} else {
						// Hit. We got our cached data, lets send it down the pipe.
						
						response.write(result);
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