import React from 'react';

import { withHistory } from 'components/WithHistory';

class HomePage extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {

		};

		console.log(this.props.history);
	}

	render()
	{
		return (
			<h1>PAGE D'ACCEUIL</h1>
		);
	}
}

export default withHistory(HomePage);
