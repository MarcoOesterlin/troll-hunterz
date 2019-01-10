import React from "react";
import "./Card.scss";
import DataTable from "../DataTable/DataTable";
import ProfileListItem from "../ProfileListItem/ProfileListItem";
import EntryBanner from "../EntryBanner/EntryBanner";

class Card extends React.Component {
  render() {
    const { entries } = this.props;
    const listItems = entries.map(entry => (
      <ProfileListItem entry={entry} key={entry.userName} />
    ));

    return (
      <div className="BaseCard">
        <h2>{this.props.title}</h2>
        {listItems}
        {/* <DataTable entries={entries} /> */}
      </div>
    );
  }
}

export default Card;
