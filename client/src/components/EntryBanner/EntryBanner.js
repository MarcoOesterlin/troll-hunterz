import React from 'react';



class EntryBanner extends React.Component {
  render() {
      const showBanner = this.props.bannerShow;
      const bannerClass = showBanner ? "entryBannerShow" : "entryBannerHide";
     
      return (
      
        <div className= {bannerClass}>
            <h2>
                Your Latest Entry: {this.props.userEntry.userName} : {this.props.userEntry.score}
            </h2>
           
        </div>
    );
}
}

export default EntryBanner;



