import React from 'react';
import { Switch as ReactSwitch } from 'react-router';

export default function Switch({ children })
{
    return (
		<div id="content" className="scrollbar-style p-3" style={{overflowY : 'auto', height : (window.innerHeight - 32) }}>
			<ReactSwitch>
				{children}
			</ReactSwitch>
		</div>
    );
}
