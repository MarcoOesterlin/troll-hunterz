import React from 'react';
import './Card.scss';
import DataTable from '../DataTable/DataTable';
import axios from 'axios';
import { api } from '../../config';


class Card extends React.Component {
    constructor() {
    super();
        
    this.state = {
        entries: [],
    };
    }

    componentDidMount() {
        this.fetchEntries();
    }

    fetchEntries = () => {
        axios.get(`${ api }/entries`)
        .then((res) => {
        const { entries } = res.data;
        this.setState({ entries });
        });
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

    

  render() {
    const { entries } = this.state;
    const BaseCard = props => (
        <h2>{props.title}</h2>
    );
    return (
        <div className="BaseCard">
            <BaseCard {...this.props} />
            <DataTable entries={ entries } />
        </div>
    );
}
}

export default Card;



