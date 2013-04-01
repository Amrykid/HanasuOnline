var http = require("http");
var url = require("url");

function start(handleRequest) {
	http.createServer(function(request, response) {
		var requestedUrl = url.parse(request.url, true);
		var path = requestedUrl.pathname;
		var query = requestedUrl.query;		
	
		handleRequest(path, query, response, function(res, ok) {
			console.log(ok);
			if (ok || res != '') {
				response.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
				response.write(res);
			} else {
				response.writeHead(404);
			}
			response.end();
		});
		//response.end();
	}).listen(8888);
}

exports.start = start;