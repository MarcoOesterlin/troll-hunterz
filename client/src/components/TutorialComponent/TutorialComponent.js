import React from "react";
import "./TutorialComponent.scss";
/**
 * Clickable component redirecting an user to the tutorial document.
 */
class TutorialComponent extends React.Component {
  render() {
    return (
      <div className="Tutorial-component">
        <a
          href="https://i.imgur.com/ISKG0Rd.jpg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Press here for help
        </a>
      </div>
    );
  }
}

export default TutorialComponent;
