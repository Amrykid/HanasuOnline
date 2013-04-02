<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Hanasu</title>
		<link rel="stylesheet" href="css/HanasuOnlineMobile.min.css" />
		<link rel="stylesheet" href="http://code.jquery.com/mobile/1.3.0/jquery.mobile.structure-1.3.0.min.css" />
		<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
		<script src="http://code.jquery.com/mobile/1.3.0/jquery.mobile-1.3.0.min.js"></script>
	</head>
	<body class="ui-mobile-viewport ui-overlay-a">
		<div data-role="page" data-theme="a">
			<div data-role="header" data-position="inline">
				<h1>Hanasu</h1>
			</div>
			<div data-role="content" data-theme="a" role="main">
				<ul id="stations" data-role="listview" data-inset="true" class="ui-listview ui-listview-inset ui-corner-all ui-shadow">
					<li data-role="list-divider" data-swatch="a" data-theme="a" data-form="ui-bar-a" role="heading" class="ui-li ui-li-divider ui-bar-a ui-first-child">Stations</li>
				</ul>
				<div id="jquery_jplayer" class="jp-jplayer"></div>
			</div>
		</div>
		<script type="text/javascript" src="js/jplayer/jquery.jplayer.min.js"></script>
		<script type="text/javascript" src="js/jquery.timer.js"></script>
		<script type="text/javascript" src="js/hanasu/hanasu.js"></script>
		<script type="text/javascript">
			$(document).ready(function() {
				var hanasu = new Hanasu();
				hanasu.initializeApplication(true);

				self.App = hanasu;
			});
		</script>
	</body>
</html>