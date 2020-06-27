////////////////////////////////////////////////////////////////////////////////////////////
// THIS FILES LOAD ALL REACT COMPONENTS CONTAINED IN THE REACT COMPONENTS FOLDER
//
// Author : Antoine Bouabana (Dicosaedrique) - 2019
//
////////////////////////////////////////////////////////////////////////////////////////////

const glob = require('glob');
const path = require('path');

const React = require("react");
const ReactDOM = require("react-dom");
const { Router, Route : ReactRoute, Switch : ReactSwitch, Redirect, Link, useLocation, useHistory } = require("react-router");
const { createMemoryHistory } = require("history");

const withHistory = Component => props => <Component { ...props } history={useHistory()} />;

// require each component files in the "react-components" dir
function loadComponents()
{
    const filesPath = path.join(__dirname, 'src', 'react-components', '/**/*.js');
    const files = glob.sync(filesPath);
    files.forEach((file) =>
    {
        var fileExports = require(file);

        for(var exportName in fileExports) // for every class or variable exported in the component file, add it to the global obj
        {
			console.log(exportName);

            if(!window.global[exportName])
                window.global[exportName] = fileExports[exportName];
            else
                throw `You can't duplicate global variable (at 'react-loader.js') : ${exportName} !`;
        }
    });
}

// load components when file is loaded
loadComponents();
