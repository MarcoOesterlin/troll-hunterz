import React from 'react';
import axios from 'axios';
import './Main.css';

class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      value: '',
      result: '-',
    };
  }
  
  onSubmitHandler = e => {
    e.preventDefault();
    const { value } = this.state;
    if (value) {
      axios.get(`http://localhost:3001/?value=${ value }`)
        .then((res) => {
          const { comparative } = res.data;
          this.setResult(comparative);
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
    const { value } = e.currentTarget;
    this.setValue(value);
  }

  render() {
    const { onSubmitHandler, onChangeHandler, state } = this;
    const { value, result } = state;
    return (
      <main>
        <form onSubmit={ onSubmitHandler }>
          <input
            type="text"
            onChange={ onChangeHandler }
            value={ value }
          />
        </form>
        <div>Result: { result }</div>
      </main>
    );
  }
}

export default Main;
