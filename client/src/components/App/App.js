import React from 'react';
import './App.scss';
import Main from '../Main/Main';
import Header from '../Header/Header';
import axios from 'axios';
import { api } from '../../config';
import TextField from '../TextField/TextField';
import DataTable from '../DataTable/DataTable';

class App extends React.Component {
  constructor() {
    super();
    this.handleScroll = this.handleScroll.bind(this);
    this.state = {
      entries: [],
      textFieldValue: '',
      showHeader: true,
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
    if(window.scrollY > 10) {
      console.log("Scrolled")
      this.setState({showHeader: false});
    } else {
      this.setState({showHeader: true});
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
      {
        this.state.showHeader?
        <Header>
          <TextField
            onSubmit={ onSubmitHandler }
            onChange={ onChangeHandler }
            value={ textFieldValue }
          />
      
        </Header>
        :null
      } 
        <Main>
          <DataTable entries={ entries } />
        </Main>
      </div>
    );
  }
}

export default App;
