import React from "react";
import "./ProfileListItem.scss";

class ProfileListItem extends React.Component {
  render() {
    const userUrl = `https://www.youtube.com/user/${this.props.entry.username}`;
    return (
      <div className="ListItem">
        <a href={userUrl} target="_blank">
          <img src={this.props.entry.imageUrl} />
        </a>
        <h2> {this.props.entry.username} </h2>
        <h3> {this.props.entry.score} </h3>
        <p>-------------------------------------------------------------</p>
      </div>
    );
  }
}

export default ProfileListItem;
