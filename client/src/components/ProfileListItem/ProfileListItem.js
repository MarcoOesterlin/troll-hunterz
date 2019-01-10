import React from "react";
import "./ProfileListItem.scss";

class ProfileListItem extends React.Component {
  render() {
    return (
      <div className="ListItem">
        <img src="https://yt3.ggpht.com/a-/AAuE7mAPBVgUYqlLw9SvJyKAVWmgkQ2-KrkgSv4_5A=s88-mo-c-c0xffffffff-rj-k-no" />
        <h2> Youtube Username </h2>
        <h3> Community Score </h3>
      </div>
    );
  }
}

export default ProfileListItem;
