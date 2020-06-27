// MAIN FILE OF THE APPLICATION

const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const NODE_ENV = "development";
// const NODE_ENV = "production";

// check if we're in debug mode (by checking arg in the node command)
global.debug = /--debug/.test(process.argv[2]);

global.__dirapp = path.resolve(__dirname);
global.__external = (NODE_ENV === "production" ? path.resolve(__dirapp, '../app.asar.unpacked') : __dirapp);

// window reference
let mainWindow;

// initialize the entire application
function initApp()
{
    makeSingleInstance(); // create a singleton for the app

    // function that initialize the app window
    function createWindow ()
    {
        // create the main window
        mainWindow = new BrowserWindow({
            width: 1320 + (debug ? 400 : 0),
            height: 742,
			frame: false,
            webPreferences: {
                nodeIntegration: true
            },
            center : true,
			show : true
        });

        if(debug)
        {
            mainWindow.webContents.openDevTools(); // open with the dev console
        }

		// load main file
		mainWindow.loadURL(url.format({
			pathname : path.join(__dirname, 'index.html'),
			protocol : 'file:',
			slashes : true
		}));

		mainWindow.on('closed', () => { // dereferenced the window
			mainWindow = null;
		});
    }

    app.on('ready', () => {
        createWindow();
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') { // need to do this for non-macOS environment
            app.quit();
        }
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });
}

// make this app a single instance app
function makeSingleInstance()
{
    if (process.mas)
        return;

    app.requestSingleInstanceLock();

    app.on('second-instance', () =>
    {
        if (mainWindow !== null)
        {
            if (mainWindow.isMinimized())
                mainWindow.restore();

            mainWindow.focus();
        }
    });
}

// start the application
initApp();
