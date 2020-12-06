import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import './sidebar.scss'
import {BrowserRouter as Router,Switch, Route,Link, BrowserRouter} from "react-router-dom";
import ReactDOM from "react-dom";
// import {AboutPage} from './About.jsx';
export default props => {
  return (
    <Router>
      <Menu right>
        <Link className="side-menu-item" to="/">Home</Link>
        <Link className="side-menu-item" to="/About">About</Link>
        <Link className="side-menu-item" to="/Contacts">Contacts</Link>
        <Link className="side-menu-item" to="/Settings">Settings</Link>
      </Menu>
      
    </Router>
  );
};

function Home(){
  return <h2>Home</h2>
}

function About(){
  return <h1></h1>
}

function Contacts(){
  return <h1></h1>
}

ReactDOM.render(
  <BrowserRouter>
  <Home/>
  </BrowserRouter>,
  document.getElementById("root")
);