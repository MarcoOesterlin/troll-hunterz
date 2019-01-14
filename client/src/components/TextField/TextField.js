import React from "react";
import "./TextField.scss";
import LinearProgress from "@material-ui/core/LinearProgress";

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
            placeholder="Insert Youtube URL - https://www.youtube.com/channel/UCq-Fj5jknLsUf-MWSy4_brA"
          />
          {isFetching && <LinearProgress size={15} className="progress-bar" />}
        </form>
      </div>
    );
  }
}

export default TextField;
