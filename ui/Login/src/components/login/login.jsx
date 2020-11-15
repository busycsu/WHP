import React from "react";
import { useHistory } from 'react-router-dom';
import fire from "../../contexts/AuthContext";
import loginImg from "../../vectors/Login.eps";

export class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state={
        userFound:true,
    }
  }

  onSubmit = () => {
    const { userFound } = this.state;

    if(userFound){
        this.props.history.push('/posts/');
    }
  }

  login() {
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    fire.auth().signInWithEmailAndPassword(email, password)
      .then((u) =>{
        console.log("Successfully Logged in");
      })
      .catch((err) => {
        console.log("Error: "+err.toString());
      })
  }

  render() {
    return (
      <div className="base-container" ref={this.props.containerRef}>
        <div className="header">Login</div>
        <div className="content">
          <div className="image">
            <img src={loginImg} />
          </div>

          <div className="loginform">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input id="email" type="text" name="username" placeholder="username" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" name="password" placeholder="password" />
            </div>
          </div>
    </div>
    <div className="footer">
        <button onClick={this.login.bind(this)} type="button" className="btn" >Login</button>
    </div>    
</div>
    );
  }
}