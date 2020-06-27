
var { useEffect } = require('react');

function Route({ children , ...routeProps})
{
    return (
        <ReactRoute {...routeProps}>
            <React.Fragment>
                {routeProps.scrollTop && <ScrollToTop />}
                {children}
            </React.Fragment>
        </ReactRoute>
    );
}

// scroll to the top of the page when navigate through the app (if precised in the route component)
function ScrollToTop() {

  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


exports.Route = Route;
