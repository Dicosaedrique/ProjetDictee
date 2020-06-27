// props.history.push('/');
class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    console.log(this.props.history);
  }

  render() {
    return /*#__PURE__*/React.createElement("h1", null, "PAGE D'ACCEUIL");
  }

}

exports.HomePage = withHistory(HomePage);