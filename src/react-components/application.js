function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ReactApp extends React.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "start", () => {
      window.onresize = () => {
        this.forceUpdate();
      };
    });

    _defineProperty(this, "save", () => {
      /* RIEN POUR L'INSTANT */
    });

    this.state = {};
    this.start();
    this.history = createMemoryHistory({
      initialEntries: ['/'],
      initialIndex: 0
    });
  }

  render() {
    return /*#__PURE__*/React.createElement(Router, {
      history: this.history
    }, /*#__PURE__*/React.createElement(Switch, null, /*#__PURE__*/React.createElement(Route, {
      scrollTop: true,
      exact: true,
      path: "/"
    }, /*#__PURE__*/React.createElement(HomePage, null))));
  }

}

exports.ReactApp = ReactApp;