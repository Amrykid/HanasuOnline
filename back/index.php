<?php
if (isset($_SERVER['QUERY_STRING'])) {
	$vars = null;
	parse_str($_SERVER['QUERY_STRING'], $vars);
	
	$stations = simplexml_load_file('..' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'Stations.xml');
	$url = urldecode($vars['url']);
	
	$found = false;
	
	foreach($stations as $station) {
		$dsURL = parse_url($station->DataSource);
		if ($station->DataSource == $url || endsWith($url, '7.html')) {
			$found = true;
			break;
		}
	}
	
	if ($found) {
		header('Access-Control-Allow-Origin: *');
		
		$opts = array(
		  'http'=>array(
			'method'=>"GET",
			'header'=>"Accept-language: en\r\n" .
					  "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.172 Safari/537.22\r\n"
		  )
		);

		$context = stream_context_create($opts);
		echo file_get_contents(urldecode($vars['url']), false, $context);
	}
}

// returns true if $str begins with $sub
function beginsWith( $str, $sub ) {
    return ( substr( $str, 0, strlen( $sub ) ) == $sub );
}

// return tru if $str ends with $sub
function endsWith( $str, $sub ) {
    return ( substr( $str, strlen( $str ) - strlen( $sub ) ) == $sub );
}

function curl($url){
	//http://stackoverflow.com/questions/3535799/file-get-contents-failed-to-open-stream
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
	$data = curl_exec($ch);
	curl_close($ch);
	return $data;
}