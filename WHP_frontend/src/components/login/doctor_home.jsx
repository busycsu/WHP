import React from 'react'
import fire from '../../contexts/AuthContext'
import Sidebar from './sidebar';
import logo from "../../vectors/logo.png"
import "./home.scss"
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import axios from '../../../node_modules/axios';
import ReactModal from 'react-modal';
import VideoPage from './VideoPage';
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
        let path = 'users/'+uid+"/report";
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

    getReport1 = () =>{
      let msg;
        var uid = fire.auth().currentUser.uid;
        console.log("uid",uid);
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
        return msg
      }

    getReport = () => {
      let msg;
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
            // get patient Name
          fire.database().ref("users/"+patientUID).on('value', snap=>{
            var patientName = snap.child("basicInfo/name").val();
            var reportList = snap.child("report");
            // TODO: correct logic: dict will replace with latest key value pair
            patientNameDic[patientName] = reportList;
          })
        })
        })
        }
        console.log("report",Object.keys(patientNameDic));

        // for(var key in patientNameDic){
        //   var snapTMP = patientNameDic[key];
        //   snapTMP.forEach(function(childNodes){
        //     var tmpReportList = childNodes.val().content;
        //     console.log(tmpReportList);
        //     for(var i=0;i<tmpReportList.length;i++){
        //       // console.log(tmpReportList[i].Category)
        //       // console.log(tmpReportList[i].Term)
        //       // console.log(tmpReportList[i].Score)
        //     }
        //   })
        // }
        console.log("report list", patientNameDic);
        if (this.state.wantRecord){
          if(Object.keys(patientNameDic).length == 0){
              msg = 
              <div className="record_msg">
                  <p id="p" style={{opacity:'60%', fontSize:"25px", fontWeight:"500px", paddingBottom:"3px"}}>No past records retrieved</p>
                  <button id="refresh" style={{border:"2px solid #b9bfc0"}} onClick={this.refresh}>Refresh Here</button>
              </div>
          }else{
            msg = <div className="record_msg">
                    <div style={{overflow:"scroll"},{scrollBehavior:"auto"}}>{
                      Object.keys(patientNameDic).map((key,index,data)=>(
                        <React.Fragment>
                          <li><button onClick={this.writePage.bind(this,key,this.getDate(patientNameDic,key))}>{key} 

                           {this.getDate(patientNameDic,key)}
                          </button></li>
                        </React.Fragment>
                      ))
                    }
                    </div>
                  </div>
          }
      } else {
          msg = <p></p>
  }
      return msg
  }

  // get report date as title
  getDate(dic,key){
    var time = '';
    dic[key].forEach(
      function(childNodes){
        time = (childNodes.val().datetime);
      }
    )
    if(time){
      return '   -   '+ time;
    }
    else{
      return '   -   unknown date';
    }
  }

  getData(dic,key){
    var data = {};
    dic[key].forEach(
      function(childNodes){
        data = (childNodes.val().content);
      }
    )
    return data;
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
    writePage(id,date){
      console.log('keys',id);
      var newWindow = window.open();
      // head style
      newWindow.document.write('<html><head><title>Report</title><style>');
      newWindow.document.write("</style>");

      // Title
      newWindow.document.write("<div className='info' style='width:50%; margin-left:auto; margin-right:auto; border:none; padding-left:2em; padding-right:2em; padding-top:1em; padding-bottom:4em; border-width:0.1px; border-radius:10px; background-color:#FFFFFF; opacity:80%; font-size:40px; font-weight:2000;'>");
      newWindow.document.write("<div style='text-align:center;'>Clinical Summary</div>");

      // general information head with grey color
      newWindow.document.write("<body className='bg' style='background-color:#e2e6e9'><div style='margin-left:auto;margin-right:auto;width:100%; padding-top:0.5em;'>");
      newWindow.document.write("<div className='info' style='width:90%; margin-left:auto; margin-right:auto; padding-left:1em; padding-right:1em; padding-top:0.1em; padding-bottom:0.1em; border-width:0.1px; border-radius:5px; background-color:#cccccc; opacity:100%; font-size:17px;'>");
      newWindow.document.write("<b style='font-size:20px;font-weight:700;'> General Information </b>");
      newWindow.document.write("</div>");

      // general information body
      newWindow.document.write("<div class='row' style = 'display:flex; width:90%; margin-left:auto; margin-right:auto; padding-left:1em; padding-right:1em; padding-top:0.1em; padding-bottom:0.1em; border-width:0.1px; border-radius:5px; background-color:#FFFFFF; opacity:100%; font-size:17px;'>");
      // general information column left
      newWindow.document.write("<div class='column' style = 'flex:50%'>");
      newWindow.document.write("<p className='nameLabel'> Name:  <span style='color:black;font-size:17px;'>"+"Name PlaceHolder"+"</span></p>");
      newWindow.document.write("<p className='nameLabel'> ID:  <span style='color:black;font-size:17px;'>"+"ID PlaceHolder"+"</span></p>");
      newWindow.document.write("<p className='dobLabel'> Date of Birth: <span style='color:black;font-size:17px;'>"+ "DOB PlaceHolder"+ "</span></p>");
      newWindow.document.write("</div>");
      // general information column right
      newWindow.document.write("<div class='column' style = 'flex:50%'>");
      newWindow.document.write("<p className='data1'> Appointment Time: <span style='color:black;font-size:17px;'>"+"Time PlaceHolder"+"</span></p>")
      newWindow.document.write("<p className='address'> Address: <span style='color:black;font-size:17px;'>"+"Address PlaceHolder"+"</span></p>")
      newWindow.document.write("<p className='phone'> Phone: <span style='color:black;font-size:17px;'>"+ "Phone PlaceHolder"+ "</span></p>");
      newWindow.document.write("</div>");
      newWindow.document.write("</div>");
 
      var snapTMP = patientNameDic[id];
          snapTMP.forEach(function(childNodes){
            if(childNodes.val().datetime.trim() == date.replace('-','').trim()){
              // newWindow.document.write("<p className='data1'> Appointment Time: <span style='color:white;font-size:30px;'>"+childNodes.val().datetime+"</span></p>")
              // newWindow.document.write("</div>");  

              var tmpReportList = childNodes.val().content;

              // head: symptom and diagnosis in one row
              newWindow.document.write("<div class='row' style = 'display:flex; width:93%; margin-left:auto; margin-right:auto; padding-left:1em; padding-right:1em; padding-top:0.1em; padding-bottom:0.1em; border-width:0.1px; border-radius:5px; background-color:#FFFFFF; opacity:100%; font-size:17px;'>");
              newWindow.document.write("<div class='column' style = 'flex:45%; font-weight:700; width:100%; margin-left:0em; margin-right:0.5em; margin-right:auto; padding-left:1em; padding-right:1em; padding-top:0.1em; padding-bottom:0.1em; border-width:0.1px; border-radius:5px; background-color:#cccccc; opacity:100%; font-size:20px;>");
              newWindow.document.write("<b style='font-size:20px;font-weight:700;'> Symptoms </b>");
              newWindow.document.write("</div>");
              newWindow.document.write("<div class='column' style = 'flex:55%; font-weight:700; width:100%; margin-left:0.5em; margin-right:0em; padding-left:1em; padding-right:1em; padding-top:0.1em; padding-bottom:0.1em; border-width:0.1px; border-radius:5px; background-color:#cccccc; opacity:100%; font-size:20px;>");
              newWindow.document.write("<b style='font-size:20px;font-weight:700;'> Diagnosis </b>");
              newWindow.document.write("</div>");
              newWindow.document.write("</div>");

              // body: symptom and diagnosis
              // symptom and diagnosis body
              newWindow.document.write("<div class='row' style = 'display:flex; width:90%; margin-left:auto; margin-right:auto; padding-left:1em; padding-right:1em; padding-top:0.1em; padding-bottom:0.1em; border-width:0.1px; border-radius:5px; background-color:#FFFFFF; opacity:100%; font-size:17px;'>");
              // symptom + diagnosis left column: symptom
              newWindow.document.write("<div class='column' style = 'flex:50%'>");
              var count = 0;
              var content = '';

              // new change for negation
              var negaDic = {};
              var diagDic = {};
              console.log(tmpReportList)
              for(var i=0;i<tmpReportList.length; i++){
                var traits = tmpReportList[i].Traits;
                var isNegated = false;
                if (traits !== undefined){
                  for(var j=0;j<traits.length;j++){
                    if(traits[j].Name==="NEGATION"){
                      isNegated = true;
                      negaDic[tmpReportList[i].Term]="delete";
                    }
                    if(traits[j].Name==="DIAGNOSIS"){
                      diagDic[tmpReportList[i].Term]="diag";
                    }
                  }
                }
              }
              console.log("negaDic",negaDic)
              // end here

              for(var i=0;i<tmpReportList.length;i++){
                if(tmpReportList[i].Category == 'MEDICAL_CONDITION'){
                  count ++;
                  if(!(tmpReportList[i].Term in negaDic)&&!(tmpReportList[i].Term in diagDic)){
                    if(tmpReportList[i].Score < 0.3){
                      content += "<span style='background-color:#e97878'>"+tmpReportList[i].Term + "</span>  ";
                    }
                    else if(tmpReportList[i].Score < 0.5){
                      content += "<span style='background-color:#f8dc81'>"+tmpReportList[i].Term + "</span>  ";
                    }
                    else{
                      content += "<span>"+tmpReportList[i].Term + "</span>  ";
                    }
                    content += '<br />'
                  }
                  
              }}
              if(count == 0){newWindow.document.write("<ul style=' opacity:80%; font-size:20px;'>None Recorded&nbsp&nbsp</ul>")}
              else{newWindow.document.write("<p style='font-size:20px;'>"+content+"</p>");}
              newWindow.document.write("<br></div>");
              newWindow.document.write("<p></p>");

              // symptom + diagnosis right column: diagnosis
              newWindow.document.write("<div class='column' style = 'flex:50%'>");
              var count = 0;
              var content = '';
              for(var i=0;i<tmpReportList.length;i++){
                if(tmpReportList[i].Category == 'MEDICAL_CONDITION'){
                  count ++;
                  if(tmpReportList[i].Term in diagDic){
                    if(tmpReportList[i].Score < 0.3){
                      content += "<span style='background-color:#e97878'>"+tmpReportList[i].Term + "</span>  ";
                    }
                    else if(tmpReportList[i].Score < 0.5){
                      content += "<span style='background-color:#f8dc81'>"+tmpReportList[i].Term + "</span>  ";
                    }
                    else{
                      content += "<span>"+tmpReportList[i].Term + "</span>  ";
                    }
                    content += '<br />'
                  }
              }}
              if(count == 0){newWindow.document.write("<ul style='color:#000000; opacity:80%; font-size:20px;'>None Recorded&nbsp&nbsp</ul>")}
              else{newWindow.document.write("<p style='font-size:20px;'>"+content+"</p>");}
              newWindow.document.write("<br></div>");
              newWindow.document.write("<p></p>");
              newWindow.document.write("</div>");

              // head: symptom and diagnosis in one row
              newWindow.document.write("<div class='row' style = 'display:flex; width:93%; margin-left:auto; margin-right:auto; padding-left:1em; padding-right:1em; padding-top:0.1em; padding-bottom:0.1em; border-width:0.1px; border-radius:5px; background-color:#FFFFFF; opacity:100%; font-size:17px;'>");
              newWindow.document.write("<div class='column' style = 'flex:45%; font-weight:700; width:100%; margin-left:0em; margin-right:0.5em; margin-right:auto; padding-left:1em; padding-right:1em; padding-top:0.1em; padding-bottom:0.1em; border-width:0.1px; border-radius:5px; background-color:#cccccc; opacity:100%; font-size:20px;>");
              newWindow.document.write("<b style='font-size:20px;font-weight:700;'> Test, Treatment, and Procedure </b>");
              newWindow.document.write("</div>");
              newWindow.document.write("<div class='column' style = 'flex:55%; font-weight:700; width:100%; margin-left:0.5em; margin-right:0em; padding-left:1em; padding-right:1em; padding-top:0.1em; padding-bottom:0.1em; border-width:0.1px; border-radius:5px; background-color:#cccccc; opacity:100%; font-size:20px;>");
              newWindow.document.write("<b style='font-size:20px;font-weight:700;'> Medication </b>");
              newWindow.document.write("</div>");
              newWindow.document.write("</div>");

              // Test and Medication body
              newWindow.document.write("<div class='row' style = 'display:flex; width:90%; margin-left:auto; margin-right:auto; padding-left:1em; padding-right:1em; padding-top:0.1em; padding-bottom:0.1em; border-width:0.1px; border-radius:5px; background-color:#FFFFFF; opacity:100%; font-size:17px;'>");
              // Test + Medication left column : Test
              newWindow.document.write("<div class='column' style = 'flex:50%'>");
              var count = 0;
              var content = '';
              for(var i=0;i<tmpReportList.length;i++){
                if(tmpReportList[i].Category == 'TEST_TREATMENT_PROCEDURE'){
                  count ++;
                  if(tmpReportList[i].Score < 0.3){
                    content += "<span style='background-color:#e97878'>"+tmpReportList[i].Term + "</span>  ";
                  }
                  else if(tmpReportList[i].Score < 0.5){
                    content += "<span style='background-color:#f8dc81'>"+tmpReportList[i].Term + "</span>  ";
                  }
                  else{
                    content += "<span>"+tmpReportList[i].Term + "</span>  ";
                  }
                  content += '<br />'
              }}
              if(count == 0){newWindow.document.write("<ul style='color:#000000; opacity:80%; font-size:20px;'>None Recorded&nbsp&nbsp</ul>")}
              else{newWindow.document.write("<p style='font-size:20px; '>"+content+"</p>");}
              newWindow.document.write("<br></div>");
              newWindow.document.write("<p></p>");

              // Test + Medication right column : Medication
              newWindow.document.write("<div class='column' style = 'flex:50%'>");
              var count = 0;
              var content = '';
              for(var i=0;i<tmpReportList.length;i++){
                if(tmpReportList[i].Category == 'MEDICATION'){
                  count ++;
                  if(tmpReportList[i].Score < 0.3){
                    content += "<span style='background-color:#e97878'>"+tmpReportList[i].Term + "</span>  ";
                  }
                  else if(tmpReportList[i].Score < 0.5){
                    content += "<span style='background-color:#f8dc81'>"+tmpReportList[i].Term + "</span>  ";
                  }
                  else{
                    content += "<span>"+tmpReportList[i].Term + "</span>  ";
                  }
                  content += '<br />'
              }}
              if(count == 0){newWindow.document.write("<ul style='color:#000000; opacity:80%; font-size:20px;'>None Recorded&nbsp&nbsp</ul>")}
              else{newWindow.document.write("<p style='font-size:20px;color:'>"+content+"</p>");}
              newWindow.document.write("</div>")
              newWindow.document.write("<br></div>");


              newWindow.document.write("<br>")
            }
            
          })

          
        newWindow.document.write('</div>');
        newWindow.document.write("<div style='margin-left:45%; margin-right:40%; width:50%'><br>");
        newWindow.document.write("<button style='font-size:30px; border:dashed; margin-left:10px;margin-right:10px; padding-left:8px; padding-right:8px; padding-top:8px;padding-bottom:8px; border:none; border-radius:7px; color:#487e95; background-color:#d3e0ea;'>Save Changes</button>")
        newWindow.document.write("<button style='font-size:30px; border-dashed; margin-left:10px;margin-right:10px; padding-left:8px; padding-right:8px; padding-top:8px;padding-bottom:8px; border:none; border-radius:7px; color:#487e95;background-color:#d3e0ea;'>Submit</button>")
        newWindow.document.write('<br></br><br></br></div></body></html>');
    }


    render(){   
        console.log("int doctor home");

        return (
          <Router>
            <Route  path="/videopage" exact render={
                    ()=>{
                        return (<VideoPage/>)
                    }
                }/>
            <Route path="/" exact render={
              ()=>{
                return(<div className="body">
                <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />

                <div className="bg">
                    <div className="logo">
                       <Link to="/">
                        <img src={logo} /></Link>
                    </div>

                    <div className="home_body" style={{marginLeft:"auto"},{marginRight:"auto"}}>

                        <div className="button-container">
                            <div className="home_msg">Welcome, Doctor {this.state.name} </div>

                            <div className="button-canvas">
                                <div className="button-item">
                                    <button className="button button-pop" id="transcript_button" onClick={()=>{this.getRecords();this.openModal();}}>Review Record</button>
                                </div>

                                <div className="button-item" >
                                    <Link to="/videopage"><button className="button button-pop" id="get_record_button"  >Meeting Room</button></Link>
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
            </div>)
              }
            }/>

                
            
            </Router>
        )
    }
}

export default DoctorHome;