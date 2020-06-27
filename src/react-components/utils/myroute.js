var {
  useEffect
} = require('react');

function Route({
  children,
  ...routeProps
}) {
  return /*#__PURE__*/React.createElement(ReactRoute, routeProps, /*#__PURE__*/React.createElement(React.Fragment, null, routeProps.scrollTop && /*#__PURE__*/React.createElement(ScrollToTop, null), children));
} // scroll to the top of the page when navigate through the app (if precised in the route component)


function ScrollToTop() {
  const {
    pathname
  } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

exports.Route = Route;