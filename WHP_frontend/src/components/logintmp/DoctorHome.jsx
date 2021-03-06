// import React from "react";
// import fire from '../../contexts/AuthContext'
// import VideoChat from '../twilio/VideoChat'

// class DoctorHome extends React.Component{
//   constructor(props){
//     super(props);
//     this.state = {
//       user: null,
//       patientNameDic:{},
//     };
//     // this.handleToggle = this.handleToggle.bind(this);
//     // this.handleSelect = this.handleSelect.bind(this);
//     this.authListener = this.authListener.bind(this);
//   }

 
//   componentDidMount() {
//     // this.rightSide.classList.add("right");
//     this.authListener();
//   }

//   authListener(){
//     fire.auth().onAuthStateChanged((user) => {
//       if(user){
//         this.setState({ user });
//       }else {
//         this.setState({ user:null });
//       }
//     })
//   }
//   logOut = () =>{
//     fire.auth().signOut();
//   }

//   getReport = () =>{
//     var uid = fire.auth().currentUser.uid;
//     var roomRef = fire.database().ref("users/"+uid+"/rooms");
//     var roomList = []
//     roomRef.on('value', snap=>{
//       snap.forEach(function(childNodes){
//         roomList.push(childNodes.key)
//       })
//     })
    
//     var tmpDic = {};
//     for(let r = 0; r<roomList.length; r++){
//       var patientUID;
//       // get patient UID
//       fire.database().ref("Rooms/"+roomList[r]).on('value', snap=>{
//         snap.forEach(function(childNodes){
//           patientUID = childNodes.key;
//         })
//       })
//       // get patient Name
//       fire.database().ref("users/"+patientUID).on('value', snap=>{
//           var patientName = snap.child("basicInfo/name").val();
//           var reportList = snap.child("report");
//           console.log("report",reportList);
//           console.log("patientName",patientName);
//           tmpDic[patientName] = reportList;

//       })
//     }
//     this.setState({
//       patientNameDic:tmpDic
//     })
//     console.log(roomList);
//     console.log(this.state.patientNameDic);
//     // console.log("report",patientNameDic['patient'].child("1612505029664/content").val());
//     for(var key in this.state.patientNameDic){
//       var snapTMP = this.state.patientNameDic[key];
//       snapTMP.forEach(function(childNodes){
//         var tmpReportList = childNodes.val().content;
//         console.log(tmpReportList);
//         for(var i=0;i<tmpReportList.length;i++){
//           console.log("category",tmpReportList[i].Category)
//           console.log("term",tmpReportList[i].Term)
//           console.log("score",tmpReportList[i].Score)
//         }
        
//       })
//     }
//   }

//   render(){
//     return (
//       <div>
//         <p>Doctor</p>
//         <VideoChat />
//         <button className="button button-pop" id="logout_button" onClick={ this.logOut }>Log Out</button>
//         <button className="getReport" onClick = {this.getReport}>get report</button>
//       </div>
//     );
    
//   }

// }
// export default DoctorHome;



import React from 'react'
import fire from '../../contexts/AuthContext'
import Sidebar from './sidebar';
import logo from "../../vectors/logo.png"
import "./home.scss"
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from 'axios';
import ReactModal from 'react-modal';

let patientNameDic = {}
class DoctorHome extends React.Component {
    
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
            patientDict: {},
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
        let path = 'users/report';
        let dataRefname = fire.database().ref(path);
        var tmp_appoints = {}
        dataRefname.on('value', snap=>{
            snap.forEach(function(childNodes){
                var tmp_html = childNodes.val().html;
                var tmp_date = childNodes.val().datetime;
                var tmp_list = [tmp_date,tmp_html];
                var tmp_key = childNodes.key;
                tmp_appoints[tmp_key] = tmp_list;
                console.log(tmp_key)
            })
        })
        this.state.appoints = tmp_appoints;
        console.log("app:",this.state.appoints);
        
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

    NewgetReport = () =>{
          var uid = fire.auth().currentUser.uid;
          var roomRef = fire.database().ref("users/"+uid+"/rooms");
          var roomList = []
          roomRef.on('value', snap=>{
            snap.forEach(function(childNodes){
              roomList.push(childNodes.key)
            })
          })
          
          for(let r = 0; r<roomList.length; r++){
            var patientUID;
            // get patient UID
            fire.database().ref("Rooms/"+roomList[r]).on('value', snap=>{
              snap.forEach(function(childNodes){
                patientUID = childNodes.key;
              })
            })
            // get patient Name
            fire.database().ref("users/"+patientUID).on('value', snap=>{
                var patientName = snap.child("basicInfo/name").val();
                var reportList = snap.child("report");
                console.log("report",reportList);
                console.log("patientName",patientName)
                patientNameDic[patientName] = reportList;
      
            })
      
          }
          console.log(roomList);
          console.log(patientNameDic);
          // console.log("report",patientNameDic['patient'].child("1612505029664/content").val());
          for(var key in patientNameDic){
            var snapTMP = patientNameDic[key];
            snapTMP.forEach(function(childNodes){
              var tmpReportList = childNodes.val().content;
              console.log(tmpReportList);
              for(var i=0;i<tmpReportList.length;i++){
                console.log(tmpReportList[i].Category)
                console.log(tmpReportList[i].Term)
                console.log(tmpReportList[i].Score)
              }
              
            })
          }
        }

    getRecords(){
        this.setState({
            wantRecord : true,
            text : "hi",
        })
        console.log(this.state.wantRecord)
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
    writePage(id, inner){
        console.log("id:",inner)
        var newWindow = window.open("http://localhost:3000/"+id,"http://localhost:3000/"+id);
        newWindow.document.write('<html><head><title>Report</title><link rel="stylesheet" type="text/css" href="styles.scss"></head><body>');
        newWindow.document.write(inner);
        newWindow.document.getElementsByTagName("DIV")[0].contentEditable="true";
        newWindow.document.write('<button>save</button>')
        newWindow.document.write('</body></html>');
    }

    getReport = () => {
        let msg;
        if (this.state.wantRecord){
            console.log(this.state.name)
            console.log(this.state.DOB)
            if(Object.keys(this.state.appoints).length == 0){
                msg = 
                <div className="record_msg">
                    <p id="p" style={{opacity:'60%', fontSize:"25px", fontWeight:"500px", paddingBottom:"3px"}}>No patient's records retrieved</p>
                    <button id="refresh" style={{border:"2px solid #b9bfc0"}} onClick={this.refresh}>Refresh Here</button>
                </div>
            }else{
                msg = <div className="record_msg">
                        <div style={{overflow:"scroll", scrollBehavior:"auto"}}>{
                            Object.keys(this.state.appoints).map((key, index) => ( 
                                <React.Fragment>
                                {
                                /* innerHtml content: 
                                String(this.state.appoints[key]).split(",").slice(1,String(this.state.appoints[key]).split(",").length) */}
                                <li><button onClick={this.writePage.bind(this,key,String(this.state.appoints[key][1]))} key={index}>{String(this.state.appoints[key]).split(",")[0]}</button></li>
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
        console.log("int doctor home");

        return (
            <div className="body">
                <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />

                <div className="bg">
                    <div className="logo">
                        <img src={logo} />
                    </div>

                    <div className="home_body" style={{marginLeft:"auto"},{marginRight:"auto"}}>

                        <div className="button-container">
                            <div className="home_msg">Welcome, Doctor {this.state.name} </div>

                            <div className="button-canvas">
                                <div className="button-item">
                                    <button className="button button-pop" id="transcript_button" onClick={()=>{this.getRecords();this.openModal();}}>Review Record</button>
                                </div>

                                <div className="button-item" >
                                    <button className="button button-pop" id="get_record_button"  >Appointement</button>
                                    <button className="button button-pop" id="logout_button" onClick={ this.logOut.bind(this) }>Log Out</button>

                                </div>
                            </div>

                        </div>

                    </div>

                </div>
                <button onClick={this.NewgetReport}>Testing button</button>
                <ReactModal 
                    isOpen={this.state.showModal}
                    ariaHideApp={false}
                    contentLabel="Minimal Modal Example"
                    className="Modal"
                    overlayClassName="Overlay"
                    onRequestClose={this.closeModal}
                    >
                    <h1 style={{fontSize:"40px",textAlign:"center"}}>Record History</h1>

                    {this.getReport()}
                </ReactModal>
            </div>
            
        )
    }
}

export default DoctorHome;