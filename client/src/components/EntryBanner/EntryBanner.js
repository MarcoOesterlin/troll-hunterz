import React from "react";
import TutorialComponent from "../TutorialComponent/TutorialComponent";
import "./EntryBanner.scss";

class EntryBanner extends React.Component {
  render() {
    const showBanner = this.props.bannerShow;
    const bannerClass = showBanner ? "entryBannerShow" : "entryBannerHide";
    const channelUrl = `https://www.youtube.com/channel/${
      this.props.userEntry.channelId
    }`;
    const showTutorial = this.props.userEntry.showTutorial;
    const roundScore = Math.round(this.props.userEntry.score * 10) / 10;

    return (
      <div className={bannerClass}>
        <h2>
          {showTutorial ? (
            <TutorialComponent />
          ) : (
            <a href={channelUrl} target="_blank">
              Your Latest Entry: {this.props.userEntry.channelTitle} : Score{" "}
              {roundScore}
            </a>
          )}
        </h2>
      </div>
    );
  }
}

export default EntryBanner;
