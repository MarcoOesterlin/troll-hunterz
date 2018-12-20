import React from 'react';
import numeral from 'numeral';
import './DataRow.scss';
import CircularProgress from '@material-ui/core/CircularProgress';

class DataRow extends React.Component {
  render() {
    const { value, score } = this.props;
    // const { comparative } = this.props;
    return (
      <tr className="data-row">
        <td className="col-value">{ value }</td>
        <td className="col-score">
          {
            isNaN(score)
              ? <CircularProgress size={ 15 } />
              : numeral(score).format('0.0')
            }
        </td>
        {/* <td className="col-comparative">{ numeral(comparative).format('0.0') }</td> */}
      </tr>
    );
  }
}

export default DataRow;
