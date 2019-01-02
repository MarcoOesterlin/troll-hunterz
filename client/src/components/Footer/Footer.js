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

           <a href="https://github.com/stefangeneralao/troll-hunterz">
            <img src={GithubLogo} alt="Github Logo" className="GithubLogo"/>
           </a>

           <a href="https://reactjs.org/">
           <img src={ReactLogo} alt="React Logo" className="ReactLogo"/>
           </a>

           <a href="https://nodejs.org/en/">
           <img src={NodeLogo} alt="Node Logo" className="NodeLogo"/>  
           </a>

           <a href="https://sass-lang.com/">
           <img src={SassLogo} alt="Sass Logo" className="SassLogo"/>
           </a>

           <a href="https://www.mongodb.com/">
           <img src={MongoDBLogo} alt="MongoDB Logo" className="MongoDBLogo"/> 
           </a>

       </footer>
    );
  }
}

export default Footer;