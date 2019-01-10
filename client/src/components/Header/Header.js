import React from 'react';
import './Header.scss';
import  TrollLogo from './Troll.png';
import EntryBanner from '../EntryBanner/EntryBanner';

class Header extends React.Component {


  render() {
    
    return (
        <header className={`${ this.props.display }`}>
          <label htmlFor="textfield">
            <h1>
              <img src={TrollLogo} alt="Troll Hunterz Logo"/>
            </h1>
          </label>
          { this.props.children }
          <EntryBanner bannerShow={this.props.bannerShow} userEntry = {this.props.userEntry}/>
        </header>
    );
  }
}

export default Header;