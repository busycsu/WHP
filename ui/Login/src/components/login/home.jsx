import React from 'react'
import fire from '../../contexts/AuthContext'
import Sidebar from './sidebar';
import logo from "../../vectors/logo.png"
import "./home.scss"
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Home extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            wantRecord : false,
            text: '',
            name: '',
            DOB: '',
        }
    }

    logOut(){
        fire.auth().signOut();
    }

    componentDidMount(){
        let uid = fire.auth().currentUser.uid;
        let path = 'users/'+uid+"/basicInfo";
        let dataRefname = fire.database().ref(path);
        dataRefname.on('value', snap=>{
            console.log("name:"+snap.val())
            this.setState({
                name : snap.child('name').val(),
                DOB : snap.child('DOB').val()
            })
        })
        // let dataRefDOB = fire.database().ref(path).child('DOB')
        // dataRefDOB.on('value', snap=>{
        //     this.setState({
        //         DOB : snap.val() 
        //     })
        // })
    }

    getRecords(){
        this.setState({
            wantRecord : true,
            text : "hi",
        })
    }

    helper(){
        this.setState({
            wantRecord : false
        })
    }

    render(){
        let msg;
        if (this.state.wantRecord){
            console.log(this.state.name)
            console.log(this.state.DOB)
            // This should be temporary here for simple demo purpose,
            // consider to move this a separate page or a large popup window 
            // instead of makeing a div visible.
            msg = <div className="record_msg">
                    <h2>Here is your record</h2>
                    <p>Name: {this.state.name}</p>
                    <p>Date of Birth: {this.state.DOB}</p>
                </div>
        } else {
            msg = <p></p>
        }
        return (
            
            <div className="body">       
                <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
                <div className="bg">
                
                 <div className="logo">
                     <img src={logo} />
                </div>
                <div className="home_body">
                    <div className="home_msg">Welcome, {this.state.name} </div>
                
                </div>
                
                <div style={{display:"flex"}}>          
                    {msg}
                    <Router>
                    <div style={{marginTop:"13em"}}>
                    <div class="box-1">
                        <div class="buton btn-one" onClick={this.getRecords.bind(this)}>
                            <span style={{fontWeight:"bold"}}>Get Records</span>
                        </div>
                    </div>
                    <div class="box-1">
                        <div class="buton btn-one" onClick={this.helper.bind(this)}>
                            <span style={{fontWeight:"bold"}}>Hide Records</span>
                        </div>
                    </div>
                    </div>
                    
                    <div class="box-2">
                        <div class="buton btn-two" onClick={(e) => (window.location = 'http://localhost:8000')}>
                            <span style={{fontSize:"25px",marginTop:"16px",fontWeight:"bold"}}>Start Transcript</span>
                        </div>
                    </div>    
                    <div style={{marginTop:"13em"}}>
                        <div class="box-1" style={{marginLeft:"18em"}}>
                        <div class="buton btn-one" onClick={this.helper.bind(this)}>
                            <span style={{fontWeight:"bold"}}>Appointment</span>
                        </div>
                    </div>

                    <div class="box-3" style={{marginLeft:"18em"}}>
                        <div class="buton btn-three" onClick={ this.logOut.bind(this) }>
                            <span >Log out</span>
                        </div>
                    </div> 
                    </div>
                    </Router>
                </div>
            <div className="home_footer">
              <p>SMART</p>
              <p>UCSB @ well health</p>
              </div>
            </div>
          </div>
        )
    }
}

export default Home;