import React from 'react';
import './App.scss';
import Main from '../Main/Main';
import Header from '../Header/Header';
import axios from 'axios';
import { api } from '../../config';
import TextField from '../TextField/TextField';
import DataTable from '../DataTable/DataTable';
import Footer from '../Footer/Footer'

class App extends React.Component {
  constructor() {
    super();
    this.handleScroll = this.handleScroll.bind(this);
    this.state = {
      entries: [],
      textFieldValue: '',
      headerSize: 'large',
    };
  }

  componentDidMount() {
    this.fetchEntries();
    window.addEventListener('scroll', this.handleScroll);
  }
  
  componentWillUnmount(){
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll(e) {
    if(window.scrollY > 300) {
      if (this.state.headerSize !== 'small') {
        this.setState({headerSize: 'small'});
      }
    } else {
      if (this.state.headerSize !== 'large') {
        this.setState({headerSize: 'large'});
      }
    }
  }


  fetchEntries = () => {
    axios.get(`${ api }/entries`)
      .then((res) => {
        const { entries } = res.data;
        this.setState({ entries });
      });
  }
  
  clearTextField = () => {
    this.setState({ textFieldValue: '' });
  }
  
  onSubmitHandler = e => {
    e.preventDefault();
    const { textFieldValue } = this.state;
    if (textFieldValue) {
      // Return if new entry already exists
      if (this.state.entries.some(e => e.value === textFieldValue)) {
        return;
      }
      
      this.setState({
        entries: [{
          value: textFieldValue,
        },
        ...this.state.entries,
      ]});
      axios.post(`${ api }/entry`, { value: textFieldValue })
        .then(() => {
          this.fetchEntries();
          this.clearTextField();
        })
        .catch(() => {
          console.log(`Failed to post entry`);
        });
    }
  }

  onChangeHandler = e => {
    const { value } = e.currentTarget;
    this.setState({ textFieldValue: value });
  }
  
  render() {
    const { onSubmitHandler, onChangeHandler } = this;
    const { entries, textFieldValue } = this.state;
    return (
      <div className="App">
        <Header display={ this.state.headerSize }>
          <TextField
            onSubmit={ onSubmitHandler }
            onChange={ onChangeHandler }
            value={ textFieldValue }
          />
      
        </Header> 
        <Main>
          <DataTable entries={ entries } />
        </Main>
        <Footer/>
      </div>
    );
  }
}

export default App;
