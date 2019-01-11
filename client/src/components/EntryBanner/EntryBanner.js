import React from "react";

class EntryBanner extends React.Component {
  render() {
    const showBanner = this.props.bannerShow;
    const bannerClass = showBanner ? "entryBannerShow" : "entryBannerHide";
    const userUrl = `https://www.youtube.com/user/${this.props.username}`;
    return (
      <div className={bannerClass}>
        <h2>
          <a href={userUrl}>
            <img src={this.props.userEntry.imageUrl} />
          </a>
          Your Latest Entry: {this.props.userEntry.username} :{" "}
          {this.props.userEntry.score}
        </h2>
      </div>
    );
  }
}

export default EntryBanner;
