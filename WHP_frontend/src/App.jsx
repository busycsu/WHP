import React from "react";
import './App.scss';
import {Login,Register} from "./components/login";
import logo from "./vectors/logo.png"
import Sidebar from './components/login/sidebar';
import fire from './contexts/AuthContext'
// import Home from './components/login/home'
import PreHome from './components/login/prehome'
import HomeLoad from "./components/login/homeLoad";

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      
      user: null,
    };
    
    this.authListener = this.authListener.bind(this);
  }


  componentDidMount() {
    this.authListener();
  }

  authListener(){
    fire.auth().onAuthStateChanged((user) => {
      if(user){
        this.setState({ user });
      }else {
        this.setState({ user:null });
      }
    })
  }


  
  render(){
    return (
      <>{this.state.user ? (<HomeLoad/>) : (<PreHome/>)}</>
    );
    
  }

}



export default App;
