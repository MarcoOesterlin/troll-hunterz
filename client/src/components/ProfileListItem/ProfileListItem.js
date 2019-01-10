import React from "react";
import "./ProfileListItem.scss";

class ProfileListItem extends React.Component {
  render() {
    const userURL = `https://www.youtube.com/user/${this.props.userName}`;
    return (
      <div className="ListItem">
        <a href={userURL}>
          <img src={this.props.imageURL} />
        </a>
        <h2> {this.props.userName} </h2>
        <h3> {this.props.score} </h3>
      </div>
    );
  }
}

export default ProfileListItem;
