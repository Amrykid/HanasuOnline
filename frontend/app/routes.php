<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

include __DIR__."/lib/Holmes/Holmes.php"; // YOLO

Route::get('/', function()
{
	if (Holmes::is_mobile()) {
		return View::make('mobile_index');
	} else {
		return View::make('index');
	}
});