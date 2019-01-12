import React from "react";
import "./Header.scss";
import TrollLogo from "./Troll.png";
import EntryBanner from "../EntryBanner/EntryBanner";

class Header extends React.Component {
  render() {
    const scrollToTop = () => {
      const c = document.documentElement.scrollTop || document.body.scrollTop;
      if (c > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, c - c / 8);
      }
    };

    return (
      <header className={`${this.props.display}`}>
        <label htmlFor="textfield">
          <h1>
            <img
              className="cursor-pointer"
              src={TrollLogo}
              alt="Troll Hunterz Logo"
              onClick={() => scrollToTop()}
            />
          </h1>
        </label>
        {this.props.children}
        {this.props.display === "large" && (
          <EntryBanner
            bannerShow={this.props.bannerShow}
            userEntry={this.props.userEntry}
          />
        )}
      </header>
    );
  }
}

export default Header;
