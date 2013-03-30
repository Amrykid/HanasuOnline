var http = require("http");
var url = require("url");

function get_shoutcast(server, callback) {
	var path = url.parse(server);
	var options = {
		host: path.hostname,
		port: path.port,
		path: '/7.html',
		method: 'GET',
		headers: {'user-agent': 'Mozilla/5.0'}
	};

	var req = http.request(options, function(res) {
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (data) {
			//console.log("BODY: " + data);

			var title = data.replace(/<.+?>/g,"").split(',')[6];
			callback(title)
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	req.end();
}

exports.get_shoutcast = get_shoutcast;