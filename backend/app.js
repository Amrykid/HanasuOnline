console.log("HanasuOnline Backend v0.1");
console.log("http://github.com/Amrykid/HanasuOnline");

var Memcached = require('memcached');
var memcached = new Memcached('server:port');

var server = require("./server");
server.start(function(path, query, response) {
	switch(path.toLowerCase()) {
		case '/song': {
			// Example: /song?station=XAMFM 
			// Returns cached song/artist information for the specified station.
			
			break;
		}
		case '/playlist': {
			// Example: /playlist?station=XAMFM
			// Returns a cached playlist file for the specified station.
			
		}
	}
});