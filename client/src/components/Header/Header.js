import React from 'react';
import './Header.scss';

class Header extends React.Component {
  render() {
    return (
      <header>
        <h1>Troll Hunterz</h1>
        { this.props.children }
      </header>
    );
  }
}

export default Header;