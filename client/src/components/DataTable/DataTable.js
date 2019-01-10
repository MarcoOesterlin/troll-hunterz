import React from 'react';
import './DataTable.scss';
import DataRow from './DataRow/DataRow';

class DataTable extends React.Component {
  render() {
    const { entries } = this.props;
    if (!entries) {
      return null;
    }
    return (
      <table>
        <thead>
          <tr>
            <th className="col-value">Value</th>
            <th className="col-score">Score</th>
            {/* <th className="col-comparative">Comparative</th> */}
          </tr>
        </thead>
        <tbody>
          { entries.map(({ value, score, comparative }) => (
            <DataRow
              key={ `datarow:${ value }` }
              value={ value }
              score={ score }
              comparative={ comparative }
            />
          ))}
        </tbody>
      </table>
    );
  }
}

export default DataTable;