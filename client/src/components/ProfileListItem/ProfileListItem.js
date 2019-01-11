import React from "react";
import "./ProfileListItem.scss";
import Divider from "../Divider/Divider";

class ProfileListItem extends React.Component {
  render() {
    const userUrl = `https://www.youtube.com/channel/${
      this.props.entry.channelId
    }`;
    const roundScore = Math.round(this.props.entry.score * 10) / 10;
    return (
      <div className="listItem">
        <Divider className="divider" />
        <a href={userUrl} target="_blank" className="profile-image">
          <img src={this.props.entry.imgUrl} alt="Profile" />
        </a>
        <h3 className="channel-title"> {this.props.entry.channelTitle} </h3>
        <h3 className="score"> {roundScore} </h3>
      </div>
    );
  }
}

export default ProfileListItem;
