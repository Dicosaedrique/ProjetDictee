import React from 'react';

export const ControllerContext = React.createContext(null);

export const withControllerContext = Component => props => (
	<ControllerContext.Consumer>
		{ controller => <Component { ...props } controller={controller} /> }
	</ControllerContext.Consumer>
);

export const ControllerProvider = ({ controller, children }) => <ControllerContext.Provider value={controller}>{children}</ControllerContext.Provider>;
