import React from "react";
import TutorialComponent from "../TutorialComponent/TutorialComponent";

class EntryBanner extends React.Component {
  render() {
    const showBanner = this.props.bannerShow;
    const bannerClass = showBanner ? "entryBannerShow" : "entryBannerHide";
    const userUrl = `https://www.youtube.com/user/${
      this.props.userEntry.username
    }`;
    const showTutorial = this.props.userEntry.showTutorial;
    const roundScore = Math.round(this.props.userEntry.score * 10) / 10;

    return (
      <div className={bannerClass}>
        <h2>
          {showTutorial ? (
            <TutorialComponent />
          ) : (
            <a href={userUrl} target="_blank">
              Your Latest Entry: {this.props.userEntry.username} :{roundScore}
            </a>
          )}
        </h2>
      </div>
    );
  }
}

export default EntryBanner;
