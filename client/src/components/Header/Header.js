import React from 'react';
import './Header.scss';
import  TrollLogo from './Troll.png';

class Header extends React.Component {


  render() {
    return (
        <header>
          <label htmlFor="textfield">
            <h1>
              <img src={TrollLogo} alt="Troll Hunterz Logo"/>
            </h1>
          </label>
          { this.props.children }
        </header>
    );
  }
}

export default Header;