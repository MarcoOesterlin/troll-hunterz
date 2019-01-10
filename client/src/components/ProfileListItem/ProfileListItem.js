import React from "react";
import "./ProfileListItem.scss";

class ProfileListItem extends React.Component {
  render() {
    const userUrl = `https://www.youtube.com/user/${this.props.username}`;
    return (
      <div className="ListItem">
        <a href={userUrl}>
          <img src={this.props.imageUrl} />
        </a>
        <h2> {this.props.username} </h2>
        <h3> {this.props.score} </h3>
      </div>
    );
  }
}

export default ProfileListItem;
