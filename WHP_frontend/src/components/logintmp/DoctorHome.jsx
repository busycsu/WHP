import React from "react";
import fire from '../../contexts/AuthContext'
import VideoChat from '../twilio/VideoChat'

let patientNameDic = {}

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

  getReport = () =>{
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

  render(){
    return (
      <div>
        <p>Doctor</p>
        <VideoChat />
        <button className="button button-pop" id="logout_button" onClick={ this.logOut }>Log Out</button>
        <button className="getReport" onClick = {this.getReport}>get report</button>
      </div>
    );
    
  }

}



export default DoctorHome;
