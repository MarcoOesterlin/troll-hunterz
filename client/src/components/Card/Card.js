import React from 'react';
import './Card.scss';
import DataTable from '../DataTable/DataTable';



class Card extends React.Component {
  render() {
    const { entries } = this.props;
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



