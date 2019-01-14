import React from "react";
import "./Main.scss";
/**
 * Wrapper component for the main section of the application.
 */
class Main extends React.Component {
  render() {
    return <main>{this.props.children}</main>;
  }
}

export default Main;
