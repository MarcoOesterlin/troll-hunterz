import React from 'react';
import numeral from 'numeral';
import './DataTable.scss';

class DataTable extends React.Component {
  render() {
    const { entries } = this.props;
    return (
      <table>
        <thead>
          <tr>
            <th className="col-value">Value</th>
            <th className="col-score">Score</th>
            <th className="col-comparative">Comparative</th>
          </tr>
        </thead>
        <tbody>
          { entries.map(({ value, score, comparative }) => (
            <tr key={ `entry:${ value }` }>
              <td className="col-value">{ value }</td>
              <td className="col-score">{ numeral(score).format('0.0') }</td>
              <td className="col-comparative">{ numeral(comparative).format('0.0') }</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default DataTable;