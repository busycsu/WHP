import React from 'react'
import fire from '../../contexts/AuthContext'
import Sidebar from './sidebar';
import logo from "../../vectors/logo.png"
import "./home.scss"
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from 'axios';
import ReactModal from 'react-modal';

class Home extends React.Component {
    
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
        }
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
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
        // let uid = fire.auth().currentUser.uid;
        // let path = 'users/'+uid+"/basicInfo";
        // let dataRefname = fire.database().ref(path);
        // dataRefname.on('value', snap=>{
        //     console.log("name:"+snap.val())
        //     this.setState({
        //         name : snap.child('name').val(),
        //         DOB : snap.child('DOB').val()
        //     })
        // })
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
        var newWindow = window.open("localhost:3000/"+id,"localhost:3000/"+id);
        newWindow.document.open();
        newWindow.document.write(inner);
        newWindow.document.close();
    }

    getReport = () => {
        let msg;
        if (this.state.wantRecord){
            console.log(this.state.name)
            console.log(this.state.DOB)
            if(Object.keys(this.state.appoints).length == 0){
                msg = 
                <div className="record_msg">
                    <p id="p" style={{opacity:'60%', fontSize:"25px", fontWeight:"500px", paddingBottom:"3px"}}>No past records retrieved</p>
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
        return (
            <div className="body">
                <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />

                <div className="bg">
                    <div className="logo">
                        <img src={logo} />
                    </div>

                    <div className="home_body" style={{marginLeft:"auto"},{marginRight:"auto"}}>

                        <div className="button-container">
                            <div className="home_msg">Welcome, {this.state.name} </div>

                            <div className="button-canvas">
                                <div className="button-item">
                                    <button className="button button-pop" id="transcript_button" onClick={()=> {(window.location = 'http://localhost:8000');this.transcriptPage.bind(this)}}>Start Transcription</button>
                                </div>

                                <div className="button-item" >
                                    <button className="button button-pop" id="get_record_button" onClick={()=>{this.getRecords();this.openModal();}} >Get Record</button>
                                    <button className="button button-pop" id="logout_button" onClick={ this.logOut.bind(this) }>Log Out</button>

                                </div>

                                <div className="button-item">
                                    <button className="button button-pop" id="appointment_button" onClick={this.helper.bind(this)}>Appointment</button>
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
                    <h1 style={{fontSize:"40px",textAlign:"center"}}>Record History</h1>

                    {this.getReport()}
                </ReactModal>
            </div>
            

        )
    }
}

export default Home;