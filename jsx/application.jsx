
class ReactApp extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = { };

		this.start();

		this.history = createMemoryHistory({
			initialEntries: ['/'],
	  		initialIndex: 0,
		});
	}

	start = () => { window.onresize = () => { this.forceUpdate(); } }

	save = () => { /* RIEN POUR L'INSTANT */ }

	render()
	{
		return (
			<Router history={ this.history }>

				<Switch>

					<Route scrollTop exact path="/">
						<HomePage />
					</Route>

				</Switch>

			</Router>
		);
	}
}

exports.ReactApp = ReactApp;