import React from 'react'
import fire from '../../contexts/AuthContext'
import Sidebar from './sidebar';
import logo from "../../vectors/logo.png"
import "./home.scss"
// import { BrowserRouter as Switch, Router, Route, Link, BrowserRouter, Redirect, NavLink } from "react-router-dom";
import axios from '../../../node_modules/axios';
import ReactModal from 'react-modal';
import DoctorPage from './doctor_home';
import VideoPage from './VideoPage'
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
var reportList = {}
var DOB = ''
var name = ''

class PatientHome extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            wantRecord : false,
            text: '',
            name: '',
            DOB: '',
            messages : [],
            appoints: {},
            showModal:false,
            user: null,
        }
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.authListener = this.authListener.bind(this)
    }

    logOut(){
        fire.auth().signOut();
    }

    transcriptPage(){
        var body = {
            uid: 'testinguid'
        };
        
        axios.post('http://127.0.0.1:8080/', body)
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
        });
    }


    componentDidMount(){
        this.authListener();
        let uid = fire.auth().currentUser.uid;
        // DELETE next line: 
        uid = 'eL91jm42z3b8HBshTb4OAUSwZqA2';
        let path = 'users/'+uid+"/basicInfo";
        let dataRefname = fire.database().ref(path);
        dataRefname.on('value', snap=>{
            snap.forEach(function(childNodes){
                if(childNodes.key == 'DOB'){
                    DOB = childNodes.val();
                }
                else if (childNodes.key == 'name'){
                    name = childNodes.val();
                }
              console.log("name",DOB);
            })
          })
        
        // let uid = fire.auth().currentUser.uid;
        // let dataRefname = fire.database().ref("users/"+uid+"/report");
        var tmp_appoints = {}
        // dataRefname.on('value', snap=>{
        //     snap.forEach(function(childNodes){
        //         var tmp_html = childNodes.val().html;
        //         var tmp_date = childNodes.val().datetime;
        //         var tmp_list = [tmp_date,tmp_html];
        //         var tmp_key = childNodes.key;
        //         tmp_appoints[tmp_key] = tmp_list;
        //         console.log(tmp_key)
        //     })
        // })
        // this.state.appoints = tmp_appoints;
        // console.log("app:",this.state.appoints);
        
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

    getRecords(){
        this.setState({
            wantRecord : true,
            text : "hi",
        })
        console.log(this.state.wantRecord)
    }

    appointment(){
        this.props.history.push("/Home");
        
    }

    helper(){
        this.setState({
            wantRecord : false
        })
    }

    refresh = () => {
		this.setState({});
    }

    openModal() {
        this.setState({ showModal: true })
    }
  
    closeModal() {
        this.setState({ showModal: false })
    }

    // for writing to a new tab
    writePage(id){
        console.log("id:",id)
        var newWindow = window.open();
        // head style
        newWindow.document.write('<html><head><title>Report</title><style>');
        newWindow.document.write("</style>");
        // body
        newWindow.document.write("</head><body className='bg' style='background-color:#e2e6e9'><div style='margin-left:auto;margin-right:auto;width:70%; padding-top:2em; overflow-y:scroll;'>");
        newWindow.document.write("<div className='info' style='width:50%; margin-left:auto; margin-right:auto; box-shadow: 2px 0px 20px 3px rgba(114,114,114,0.79);border:none; padding-left:2em; padding-right:2em; padding-top:0.5em; padding-bottom:0.4em; border-width:0.1px; border-radius:10px; background-color:#86a3c3; opacity:80%; font-size:20px;'>");
        newWindow.document.write("<p className='nameLabel' > Patient Name:  <span style='color:white;font-size:30px;'>"+name+"</span></p>");
        newWindow.document.write("<p className='dobLabel'> Date of Birth: <span style='color:white;font-size:30px;'>"+ DOB+ "</span></p>");
        
        newWindow.document.write("<p className='data1'> Appointment Time: <span style='color:white;font-size:30px;'>"+id+"</span></p>")
        newWindow.document.write("</div>");
        // Symptoms
        newWindow.document.write("<div style='width:50%; margin-left:auto; margin-right:auto; box-shadow: 2px 0px 20px 3px rgba(114,114,114,0.79);text-align:center; border:none; padding-left:2em; padding-right:2em;margin-top:0.7em;border-width:0.1px; border-radius:10px; background-color:#d9dab0; opacity:80%; font-size:20px;'><p className='symptoms' style='float:left;'> This patient has following symptions:</p><br><br>");
        var count = 0;
        var content = ''
        for (var i = 0; i<reportList[id].length; i++){
            if(reportList[id][i].Category == 'MEDICAL_CONDITION'){
                count ++;
                content += "<span>"+reportList[id][i].Term + "</span> "
            }
            content+="<span>&nbsp&nbsp</span>";
        }
        if(count == 0){newWindow.document.write("<ul style='color:#ffffff; opacity:80%; font-size:23px;'>None Recorded&nbsp&nbsp</ul>")}
        else{newWindow.document.write("<p style='font-size:25px;color:#5c2c1f; font-weight:700;'>"+content+"</p>");}
        newWindow.document.write("<br></div>");

        // diagnosis 
        newWindow.document.write("<div style='width:50%; margin-left:auto; margin-right:auto; box-shadow: 2px 0px 20px 3px rgba(114,114,114,0.79);text-align:center; border:none; padding-left:2em; padding-right:2em;margin-top:0.7em;border-width:0.1px; border-radius:10px; background-color:#86a3c3; opacity:80%; font-size:20px;'><p className='diagnosis' style='float:left;'> The Diagnosis:</p><br><br>")
        var count =0;
        var content = '';
        for (var i = 0; i<reportList[id].length; i++){
            if(reportList[id][i].Category == 'DIAGNOSIS'){
                count ++;
                content += "<span>"+reportList[id][i].Term + "</span> "
            }
            content+="<span>&nbsp&nbsp</span>";
        }
        if(count == 0){newWindow.document.write("<ul style='color:#ffffff; opacity:80%; font-size:23px;'>None Recorded&nbsp&nbsp</ul>")}
        else{newWindow.document.write("<p style='font-size:25px;color:#5c2c1f; font-weight:700;'>"+content+"</p>");}

        newWindow.document.write("<br></div>")

        // tests, treatments and procedure
        newWindow.document.write("<div style='width:50%; margin-left:auto; margin-right:auto; box-shadow: 2px 0px 20px 3px rgba(114,114,114,0.79);text-align:center; border:none; padding-left:2em; padding-right:2em;margin-top:0.7em;border-width:0.1px; border-radius:10px; background-color:#d9dab0; opacity:80%; font-size:20px;'><p className='treatment' style='float:left;'> Tests, Treatment and Procedure:</p><br><br>")
        var count = 0;
        var content='';
        for (var i = 0; i<reportList[id].length; i++){
            if(reportList[id][i].Category == 'TEST_TREATMENT_PROCEDURE'){
                count ++;
                content += "<span>"+reportList[id][i].Term + "</span> "
            }
            content+="<span>&nbsp&nbsp</span>";
        }
        if(count == 0){newWindow.document.write("<ul style='color:#ffffff; opacity:80%; font-size:23px;'>None Recorded&nbsp&nbsp</ul>")}
        else{newWindow.document.write("<p style='font-size:25px;color:#5c2c1f; font-weight:700;'>"+content+"</p>");}
        newWindow.document.write("<br></div>")

        // medication
        newWindow.document.write("<div style='width:50%; margin-left:auto; margin-right:auto; box-shadow: 2px 0px 20px 3px rgba(114,114,114,0.79);text-align:center; border:none; padding-left:2em; padding-right:2em;margin-top:0.7em;border-width:0.1px; border-radius:10px; background-color:#86a3c3; opacity:80%; font-size:20px;'><p className='medication'style='float:left;'> Medication for this patient:</p><br><br>")
        var count = 0;
        var content='';
        for (var i = 0; i<reportList[id].length; i++){
            if(reportList[id][i].Category == 'MEDICATION'){
                count ++;
                content += "<span>"+reportList[id][i].Term + "</span> "
            }
            content+="<span>&nbsp&nbsp</span>";
        }
        if(count == 0){newWindow.document.write("<ul style='color:#ffffff; opacity:80%; font-size:23px;'>None Recorded&nbsp&nbsp</ul>")}
        else{newWindow.document.write("<p style='font-size:25px;color:#5c2c1f; font-weight:700;'>"+content+"</p>");}

        newWindow.document.write("<br></div><br></br>")
        newWindow.document.write('</div></body></html>');
    }

    getReport = () => {
        let msg;
        var uid = fire.auth().currentUser.uid;

        // delete next
        // uid = 'eL91jm42z3b8HBshTb4OAUSwZqA2';

        var reportRef = fire.database().ref("users/"+uid+"/report");

        reportRef.on('value', snap=>{
            snap.forEach(function(childNodes){
              reportList[(childNodes.val().datetime)] = childNodes.val().content;
            })
          })
          console.log(reportList)
        
        
        if (this.state.wantRecord){

            if(Object.keys(reportList).length == 0){
                msg = 
                <div className="record_msg">
                    <p id="p" style={{opacity:'60%', fontSize:"25px", fontWeight:"500px", paddingBottom:"3px"}}>No past records retrieved</p>
                    <button id="refresh" style={{border:"2px solid #b9bfc0"}} onClick={this.refresh}>Refresh Here</button>
                </div>
            }else{
                msg = <div className="record_msg">
                        <div style={{overflow:"scroll", scrollBehavior:"auto"}}>{
                            Object.keys(reportList).map((key)=>(
                                <React.Fragment>
                                  <li><button onClick={this.writePage.bind(this,key)}> 
                                   {key}
                                  </button></li>
                                </React.Fragment>
                              ))}
                        </div>
                    </div>
            }
        } else {
            msg = <p></p>
    }
        return msg
    }

    render(){  
        console.log("in patient home"); 
        return (
            <Router>
                <Route  path="/videopage" exact strict render={
                    ()=>{
                        return (<VideoPage/>)
                    }
                }/>
                <Route path="/" exact strict render={
                    ()=>{
                        return(
                         <div className="body">
                <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />

                <div className="bg">
                    <div className="logo">
                        <Link to="/">
                        <img src={logo} /></Link>
                    </div>

                    <div className="home_body" style={{marginLeft:"auto"},{marginRight:"auto"}}>

                        <div className="button-container">
                            <div className="home_msg">Welcome, {this.state.name} </div>

                            <div className="button-canvas">
                                <div className="button-item">
                                        <Link to="/videopage">
                                       <button className="button button-pop" id="appointment_button" >Meeting Room</button>
                                        </Link>
                                    
                                </div>
                                <div className="button-item" >
                                    <button className="button button-pop" id="get_record_button" onClick={()=>{this.getRecords();this.openModal();}} >Get Record</button>
                                    <button className="button button-pop" id="logout_button" onClick={ this.logOut.bind(this) }>Log Out</button>

                                </div>

                                


                            </div>

                        </div>

                    </div>

                </div>
                <ReactModal 
                    isOpen={this.state.showModal}
                    ariaHideApp={false}
                    contentLabel="Minimal Modal Example"
                    className="Modal"
                    overlayClassName="Overlay"
                    onRequestClose={this.closeModal}
                    >
                    <h1 style={{fontSize:"40px",textAlign:"center"}}>Past Appointment Record</h1>
                    {this.getReport()}
                </ReactModal> 
    
            </div>   
                        )
                    }
                }/>
            
            
            </Router>
        )
    }
}

export default PatientHome;