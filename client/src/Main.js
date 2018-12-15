import React from 'react';
import axios from 'axios';
import './Main.css';
import { api } from './config.js';

class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      value: '',
      result: '-',
      entries: [],
    };
  }

  componentDidMount() {
    console.log('baba');
    axios.get(`${ api }/entries`)
      .then((res) => {
        const { entries } = res.data;
        this.setState({ entries });
      });
  }
  
  onSubmitHandler = e => {
    e.preventDefault();
    const { value } = this.state;
    if (value) {
      axios.post(`${ api }/entry`, { value })
        .then((res) => {
          const { comparative } = res.data;
          this.setResult(comparative);
          
          axios.get(`${ api }/entries`)
            .then((res) => {
              const { entries } = res.data;
              this.setState({ entries });
              this.clearValue();
            });
        })
        .catch(() => {
          this.setResult('Failed to analyze');
        });
    } else {
      this.clearResult();
    }
  }

  setResult = value => {
    this.setState({
      result: value,
    });
  }

  clearResult = () => {
    this.setState({
      result: '-',
    });
  }

  setValue = value => {
    this.setState({
      value: value,
    });
  }

  clearValue = () => {
    this.setState({
      value: '',
    });
  }

  onChangeHandler = e => {
    console.log(e.currentTarget.key);
    const { value } = e.currentTarget;
    this.setValue(value);
  }

  render() {
    const { onSubmitHandler, onChangeHandler, state } = this;
    const { value, result, entries } = state;
    return (
      <main>
        <form onSubmit={ onSubmitHandler }>
          <input
            type="text"
            onChange={ onChangeHandler }
            value={ value }
          />
        </form>
        <table>
          <thead>
            <tr>
              <th className="col-value">Value</th>
              <th className="col-score">Score</th>
            </tr>
          </thead>
          <tbody>
            {
              entries.map(({ value, score }) => (
                <tr key={ `entry:${ value }` }>
                  <td className="col-value">{ value }</td>
                  <td className="col-score">{ score }</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </main>
    );
  }
}

export default Main;
