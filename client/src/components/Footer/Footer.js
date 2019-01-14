import React from 'react';
import './Footer.scss';
import ReactLogo from './React.png';
import GithubLogo from './Github.png';
import MongoDBLogo from './Mongo.png';
import NodeLogo from './Nodejs.png';
import SassLogo from './Sass.png'

class Footer extends React.Component {


  render() {
    return (
       <footer>

           <a href="https://github.com" className="GithubLogo">
              <img src={GithubLogo} alt="Github Logo" />
           </a>

           <a href="https://reactjs.org/" className="ReactLogo">
            <img src={ReactLogo} alt="React Logo" />
           </a>

           <a href="https://nodejs.org/en/" className="NodeLogo">
            <img src={NodeLogo} alt="Node Logo" />  
           </a>

           <a href="https://sass-lang.com/" className="SassLogo">
            <img src={SassLogo} alt="Sass Logo" />
           </a>

           <a href="https://www.mongodb.com/" className="MongoDBLogo">
            <img src={MongoDBLogo} alt="MongoDB Logo" /> 
           </a>

       </footer>
    );
  }
}

export default Footer;