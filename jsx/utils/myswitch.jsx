
function Switch({ children })
{
    return (
		<div id="content" className="scrollbar-style p-3" style={{overflowY : 'auto', height : (window.innerHeight - 32) }}>
			<ReactSwitch>
				{children}
			</ReactSwitch>
		</div>
    );
}


exports.Switch = Switch;
