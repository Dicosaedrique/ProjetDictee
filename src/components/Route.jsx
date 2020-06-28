import React, { useEffect } from 'react';
import { Route as ReactRoute } from 'react-router';

import { useLocation } from 'react-router';

export default function Route({ children , ...routeProps})
{
    return (
        <ReactRoute {...routeProps}>
            <>
                {routeProps.scrollTop && <ScrollToTop />}
                {children}
            </>
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
