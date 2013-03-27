<?php
if (isset($_SERVER['QUERY_STRING'])) {
	$vars = null;
	parse_str($_SERVER['QUERY_STRING'], $vars);
	
	if (endsWith($vars['url'], ".m3u") || endsWith($vars['url'], ".pls")) {
		header('Access-Control-Allow-Origin: *');
		echo file_get_contents($vars['url']);
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