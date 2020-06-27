function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var mountOnce = true;

class WindowFrame extends React.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "componentDidMount", () => {
      if (mountOnce) {
        mountOnce = false;
        remote.getCurrentWindow().show();
      }
    });
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      id: "frame",
      className: "d-flex flex-row justify-content-between align-items-center w-100"
    }, /*#__PURE__*/React.createElement("span", {
      className: "white-text pl-2 non-selectionnable"
    }, APP_NAME), /*#__PURE__*/React.createElement("div", {
      className: "d-flex justify-content-end align-items-center non-draggable"
    }, /*#__PURE__*/React.createElement("i", {
      onClick: () => {
        remote.getCurrentWindow().minimize();
      },
      className: "fas fa-window-minimize py-2 px-3 white-text fade-hover"
    }), /*#__PURE__*/React.createElement("i", {
      onClick: () => {
        if (!remote.getCurrentWindow().isMaximized()) remote.getCurrentWindow().maximize();else remote.getCurrentWindow().unmaximize();
      },
      className: "far fa-window-maximize py-2 px-3 white-text fade-hover"
    }), /*#__PURE__*/React.createElement("i", {
      onClick: () => {
        remote.app.quit();
      },
      className: "fas fa-times py-2 px-3 white-text red-hover"
    })));
  }

}

exports.WindowFrame = WindowFrame;