import React from 'react';
import { remote } from 'electron';

import Constants from 'src/constants';

var mountOnce = true;

export default class WindowFrame extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	componentDidMount = () =>
	{
		if(mountOnce)
		{
			mountOnce = false;
			remote.getCurrentWindow().show();
		}
	}

	render()
	{
		return (
			<div id="frame" className="d-flex flex-row justify-content-between align-items-center w-100">
				<span className="white-text pl-2 non-selectionnable">{Constants.APP_NAME}</span>
				<div className="d-flex justify-content-end align-items-center non-draggable">
					<i onClick={() => { remote.getCurrentWindow().minimize(); }} className="fas fa-window-minimize py-2 px-3 white-text fade-hover"></i>
					<i onClick={() =>
						{
							if(!remote.getCurrentWindow().isMaximized())
								remote.getCurrentWindow().maximize();
							else
								remote.getCurrentWindow().unmaximize();
						}} className="far fa-window-maximize py-2 px-3 white-text fade-hover"></i>
					<i onClick={() => { remote.app.quit(); }} className="fas fa-times py-2 px-3 white-text red-hover"></i>
				</div>
			</div>
		);
	}
}
