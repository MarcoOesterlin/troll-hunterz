import React from "react";

class EntryBanner extends React.Component {
  render() {
    const showBanner = this.props.bannerShow;
    const bannerClass = showBanner ? "entryBannerShow" : "entryBannerHide";
    const userURL = `https://www.youtube.com/user/${this.props.userName}`;
    return (
      <div className={bannerClass}>
        <h2>
          <a href={userURL}>
            <img src={this.props.userEntry.imageUR} />
          </a>
          Your Latest Entry: {this.props.userEntry.userName} :{" "}
          {this.props.userEntry.score}
        </h2>
      </div>
    );
  }
}

export default EntryBanner;
