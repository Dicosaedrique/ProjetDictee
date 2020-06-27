function Switch({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    id: "content",
    className: "scrollbar-style p-3",
    style: {
      overflowY: 'auto',
      height: window.innerHeight - 32
    }
  }, /*#__PURE__*/React.createElement(ReactSwitch, null, children));
}

exports.Switch = Switch;