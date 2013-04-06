<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>Hanasu</title>
	<link rel="stylesheet" type="text/css" href="css/fonts.css">
	<link rel="stylesheet" type="text/css" href="css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="css/styles.css">
</head>
<body>
	<header id="header">
		<div id="songArea">
			<img id="coverImg" src="img/square.png">
			<h1 id="songTitle">Ready</h1>
			<h2 id="artistName">and Waiting</h2>
		</div>
		<div id="controls">
			<button id="controlPlayPause" class="icon-play"></button>
		</div>
		<input id="volumeControl" type="range" min="0" max="100" value="50">
		<span id="volumeIcon" class="icon-volume-down"></span>
	</header>
	<div>
		<div id="jquery_jplayer" class="jp-jplayer"></div>
		</div>
	</div>
	<div id="stations">
	</div>
	<footer id="footer">
		<nav>
			<button id="historyButton">History</button>
			<button id="faqButton">FAQ</button>
		</nav>
		<div id="searchContainer">
			<input type="search" placeholder="Search"/>
			<button class="icon-search"></button>
		</div>
		<button id="settingsButton" class="icon-cog"></button>
	</footer>
	<div id="paneCover" class="">
		<div class="pane dialog">
			<header>
				<h1>Dialog</h1>
				<button class="closePane icon-remove"></button>
			</header>
			<p>Message</p>
			<footer>
				<button class="dialogButton">Dismiss</button>
			</footer>
		</div>
		<div class="pane" id="settingsPane">
			<header>
				<h1>Settings</h1>
				<button class="closePane icon-remove"></button>
			</header>
			<ul>
				<li><a href="#tab2">General</a></li>
				<li><a href="#tab1">Connection</a></li>
				<li><a href="#tab0">About</a></li>
			</ul>
			<div class="tab" id="tab2">
				<h2>Notifications:</h2><button class="btn" id="notiToggle">Enable Notifications</button>
			</div>
			<div class="tab" id="tab1">Empty</div>
			<div class="tab" id="tab0">
				<h2>HanasuOnline 0.1</h2>
				<p>A radio player for listening to asian music.</p>
				<a href="https://github.com/Amrykid/HanasuOnline">View on Github</a>
			</div>
		</div>
	</div>
</body>
<script type="text/javascript" src="js/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="js/jquery-ui-1.10.2.custom.min.js"></script>
<script type="text/javascript" src="js/jplayer/jquery.jplayer.min.js"></script>
<script type="text/javascript" src="js/jquery.timer.js"></script>
<script type="text/javascript" src="js/hanasu/hanasu.js"></script>
<script type="text/javascript" src="js/core.js"></script>
<script type="text/javascript" src="js/html5slider.js"></script>
</html>