import React,{ useRef, useState , Fragment}  from "react";
import registImg from "../../vectors/Password.png";
import { BrowserRouter, Route, Switch,Link } from 'react-router-dom';
import { Login } from './login';
// import { useAuth } from '../../contexts/AuthContext'
import fire from '../../contexts/AuthContext'
// const {signup} = useAuth()

export class Register extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            userName: '',
            password: '',
            name: '',
            dateOfBirth: '',
            email: '',
        }
        
    }

    async clickSubmit(e){
        e.preventDefault();
        // try{
        //     await signup(this.state.email, this.state.password)
        // } catch{
        //     setError('Failed to create an account')
        // }
        console.log(this.state.userName)
        console.log(this.state.password)
        console.log(this.state.name)
        console.log(this.state.dateOfBirth)
        console.log(this.state.email)
        
        // await fire.database().ref('name').push(this.state.name)
        // await fire.database().ref('DOB').push(this.state.dateOfBirth)
        await fire.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then((u)=>{
        }).catch((error)=>{
            console.log("there is an unkonwn error")
            console.log(error);
        });
        let uid = fire.auth().currentUser.uid;
        let usersRef = fire.database().ref().child('users/'+uid);
        
        usersRef.set({
            basicInfo : {
                username: this.state.userName,
                DOB: this.state.dateOfBirth,
                name: this.state.name,
                email: this.state.email
            }
        })
        console.log("uid:",fire.auth().currentUser.uid)
        
    }

    updateUserName(evt){
        this.setState({
            userName: evt.target.value
        })
    }
    updatePassword(evt){
        this.setState({
            password: evt.target.value
        })
    }
    updateName(evt){
        this.setState({
            name: evt.target.value
        })
    }
    updateDOB(evt){
        this.setState({
            dateOfBirth: evt.target.value
        })
    }
    updateEmail(evt){
        this.setState({
            email: evt.target.value
        })
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
                            <input type="text" name = "username" placeholder="username" value={this.state.userName}
                                onChange={evt => this.updateUserName(evt)}/>
                        </div>
                        <div id="frm1" className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" name = "password" placeholder="password" value={this.state.password}
                                onChange={evt => this.updatePassword(evt)}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input type="name" name = "name" placeholder="name" value={this.state.name}
                                onChange={evt => this.updateName(evt)}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="dob">Date of Birth</label>
                            <input type="date" name = "dob" placeholder="MM/DD/YYYY" value={this.state.dateOfBirth}
                                onChange={evt => this.updateDOB(evt)}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" name = "email" placeholder="email" value={this.state.email}
                                onChange={evt => this.updateEmail(evt)}/>
                        </div>
                        
                    </div>
                </div>
                <div className="footer">
                        {/* notification about successfully created a account then direct to login tab */}
                        <button type="button" className="btn" onClick={this.clickSubmit.bind(this)}>
                            Create Account
                        </button>
                </div>
            </div>
    }


}
