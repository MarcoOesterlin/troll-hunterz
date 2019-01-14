import React from "react";
import "./TextField.scss";
import LinearProgress from "@material-ui/core/LinearProgress";

/**
 * Component allowing an user to enter input to the application.
 */
class TextField extends React.Component {
  render() {
    const { onSubmit, onChange, value, isFetching } = this.props;
    return (
      <div className="text-field">
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="textfield"
            id="textfield"
            onChange={onChange}
            value={value}
            placeholder="Insert Youtube URL Here"
          />
          {isFetching && <LinearProgress size={15} className="progress-bar" />}
        </form>
      </div>
    );
  }
}

export default TextField;
