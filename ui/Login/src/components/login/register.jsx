import React from "react";
import registImg from "../../vectors/Password.svg";
import { BrowserRouter, Route, Switch,Link } from 'react-router-dom';
import {Login} from './login';

export class Register extends React.Component{

    constructor(props){
        super(props);
    }


    render(){
        return <div className="base-container" ref={this.props.containerRef}>
                <div className="header">Register</div>
                <div className="content">
                    <div className="image">
                        <img src={registImg} />
                    </div>
                    <div className="registerform">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" name = "username" placeholder="username"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" name = "password" placeholder="password"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Name</label>
                            <input type="name" name = "name" placeholder="name"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="dob">Date of Birth</label>
                            <input type="dob" name = "dob" placeholder="date of birth"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" name = "email" placeholder="email"/>
                        </div>
                        
                    </div>
                </div>
                <div className="footer">
                        {/* notification about successfully created a account then direct to login tab */}
                        <button type="button" className="btn" onClick={() => {alert(" Account Created! \n Please Login")}}>
                            Create Account
                        </button>
                </div>
            </div>
    }


}
