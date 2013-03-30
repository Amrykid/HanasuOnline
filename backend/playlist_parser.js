var http = require("http");
var url = require("url");
var S = require('string');

function get_stream_pls(link, callback) {
	console.log('PLS Resolve: ' + link);
	get_stream(link, function(data) {
		var stream = '';
	
		var lines = data.split('\n');
		for(var i = 0; i < lines.length; i++) {
			if (S(lines[i].toLowerCase()).startsWith("file1=")) {
				stream = lines[i].substring('file1='.length);
				console.log('PLS Resolve-New: ' + stream);
			}
		}
		
		if (S(stream).endsWith('/stream/1/')) {
			stream = stream.replace('/stream/1/', '');
		}
		
		callback(stream)
	});
}

function get_stream(link, callback) {
	var path = url.parse(link);

	var options = {
		host: path.hostname,
		port: path.port,
		path: path.path,
		method: 'GET'
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (data) {
			console.log('Got playlist data from: ' + path);
			console.log(data);
			callback(data);
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	req.end();
}

exports.get_stream_pls = get_stream_pls;