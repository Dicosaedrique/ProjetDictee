import React from 'react';
import { remote } from 'electron';

const { dialog } = remote;

export default class BasePage extends React.Component
{
	constructor(props)
	{
		super(props);
	}

	showInfos = (message) =>
	{
		dialog.showMessageBox({ title : 'Infos', message });
	}

	showError = (message) =>
	{
		dialog.showErrorBox('Erreur !', message);
	}
}
