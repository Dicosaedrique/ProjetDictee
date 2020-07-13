import React from 'react';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';

import Switch from 'components/Switch';
import Route from 'components/Route';
import HomePage from 'pages/HomePage';
import StartPage from 'pages/StartPage';
import Controller from 'src/controller';
import { ControllerProvider } from 'components/ControllerContext';

export default class ReactApp extends React.Component
{
	constructor(props)
	{
		super(props);

		this.controller = new Controller();

		this.state = {
			ready : false,
			error : null
		}

		this.history = createMemoryHistory({
			initialEntries: ['/'],
	  		initialIndex: 0,
		});
	}

	componentDidMount = () =>
	{
		window.onresize = () => { this.forceUpdate(); }

		this.controller.init()
		.then(() =>
		{
			this.setState({ ready : true });
		})
		.catch(err =>
		{
			console.error(err);
			this.setState({ error : "Une erreur est survenue au chargement de l'application : " + JSON.stringify(err) });
		});
	}

	save = () => { this.controller.save(); }

	render()
	{
		const { ready, error } = this.state;

		if(ready)
		{
			return (
				<ControllerProvider controller={this.controller}>
					<Router history={this.history}>

						<Switch>

							<Route scrollTop exact path="/">
								<HomePage />
							</Route>
							<Route scrollTop exact path="/start">
								<StartPage />
							</Route>

						</Switch>

					</Router>
				</ControllerProvider>
			);
		}
		else
		{
			return (
				<>
					<div style={{ position : 'fixed', top : '50%', left : '50%', right : '50%', bottom : '50%' }}>
						<div className="spinner-border text-primary" role="status">
							<span className="sr-only">Chargement...</span>
						</div>
					</div>
					{ error !== null && <p style={{ color : 'red' }}>{error}</p> }
				</>
			);
		}
	}
}
