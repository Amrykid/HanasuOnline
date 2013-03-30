var http = require("http");
var url = require("url");

function start(handleRequest) {
	http.createServer(function(request, response) {
		var requestedUrl = url.parse(request.url, true);
		var path = requestedUrl.pathname;
		var query = requestedUrl.query;		
	
		response.writeHead(200, {"Content-Type": "text/plain"});
	
		handleRequest(path, query, response, function(res) {
			response.write(res);
			response.end();
		});
		//response.end();
	}).listen(8888);
}

exports.start = start;