import React from "react";
import fire from '../../contexts/AuthContext'
import VideoChat from '../twilio/VideoChat'
class DoctorHome extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      user: null,
    };
    // this.handleToggle = this.handleToggle.bind(this);
    // this.handleSelect = this.handleSelect.bind(this);
    this.authListener = this.authListener.bind(this);
  }

 
  componentDidMount() {
    // this.rightSide.classList.add("right");
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
  logOut = () =>{
    fire.auth().signOut();
  }

 

  render(){
    return (
      <div>
        <p>Doctor</p>
        <VideoChat />
        <button className="button button-pop" id="logout_button" onClick={ this.logOut }>Log Out</button>

      </div>
    );
    
  }

}



export default DoctorHome;
