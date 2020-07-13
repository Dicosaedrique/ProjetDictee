////////////////////////////////////////////////////////////////////////////////////////////
// THIS FILE CONTAINS THE MAIN FUNCTION TO CALL TO START THE APPLICATION
//
// Author : Antoine Bouabana (Dicosaedrique) - 2020
//
////////////////////////////////////////////////////////////////////////////////////////////

// IMPORT

import React from 'react';
import ReactDOM from 'react-dom';
import { remote } from 'electron';

import ReactApp from 'src/Application';
import WindowFrame from 'components/WindowFrame';

const debug = remote.getGlobal('debug');
const __dirapp = remote.getGlobal('__dirapp');
const __external = remote.getGlobal('__external');

var reactApp;

// function to start the application
function start()
{
	ReactDOM.render(React.createElement(WindowFrame, null), $('#frame_anchor')[0]);

	reactApp = ReactDOM.render(React.createElement(ReactApp, null), $('#root')[0]);
}

// function to call when the application is stopped
function stop()
{
    reactApp.save();
}

window.onbeforeunload = () => { stop(); }

window.onload = () => { start(); };
