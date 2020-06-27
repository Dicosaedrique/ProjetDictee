////////////////////////////////////////////////////////////////////////////////////////////
// THIS FILE CONTAINS THE MAIN FUNCTION TO CALL TO START THE APPLICATION
//
// Author : Antoine Bouabana (Dicosaedrique) - 2019
//
////////////////////////////////////////////////////////////////////////////////////////////

// IMPORT
const { remote, ipcRenderer, shell } = require('electron');
const { dialog } = remote;

const debug = remote.getGlobal('debug');
const __dirapp = remote.getGlobal('__dirapp');
const __external = remote.getGlobal('__external');

const fs = require('fs');

const APP_NAME = "Projet Dictée (défi en 24h) by Dicosaedrique";

var reactApp;

function promptDirectory(callback = null)
{
	dialog.showOpenDialog({
		properties: ['openDirectory']
	}).then(({ canceled, filePaths }) =>
	{
		if(!canceled && filePaths && filePaths.length === 1)
		{
			if(callback) callback(filePaths[0]);
		}
	}).catch(err =>
	{
		console.log(err);
		if(callback) callback(undefined);
	});
}

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
