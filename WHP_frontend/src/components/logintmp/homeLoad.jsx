import React from 'react'
import fire from '../../contexts/AuthContext'
import Sidebar from './sidebar';
import logo from "../../vectors/logo.png"
import "./home.scss"
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from 'axios';
import ReactModal from 'react-modal';
import DoctorHome from './DoctorHome';
import PatientHome from './PatientHome';

class HomeLoad extends React.Component {
    
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
            userType: '',
        }
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
    }

    logOut(){
        fire.auth().signOut();
    }

    // transcriptPage(){
    //     var body = {
    //         uid: 'testinguid'
    //     };
        
    //     axios.post('http://127.0.0.1:8080/', body)
    //       .then(function (response) {
    //         console.log(response);
    //       })
    //       .catch(function (error) {
    //         console.log(error);
    //     });
    // }

    componentDidMount(){
        
        let uid = fire.auth().currentUser.uid;
        let path = 'users/'+uid;
        let dataRefname = fire.database().ref(path);
        var tmp_appoints = {}
        dataRefname.on('value', snap=>{
            this.setState({
                userType: snap.child('userType').val()
            })
            // this.state.userType = snap.child('userType').val();
            console.log(snap.child('userType').val())
            console.log("userType1",this.state.userType);
            
        })
        console.log("userType2",this.state.userType);
        
    }

    getRecords(){
        this.setState({
            wantRecord : true,
            text : "hi",
        })
        // console.log(this.state.wantRecord)
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
        // console.log("id:",inner)
        var newWindow = window.open("localhost:3000/"+id,"localhost:3000/"+id);
        newWindow.document.open();
        newWindow.document.write(inner);
        newWindow.document.close();
    }

    getReport = () => {
        let msg;
        if (this.state.wantRecord){
            // console.log(this.state.name)
            // console.log(this.state.DOB)
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
            <>{this.state.userType=="doctor" ? (<DoctorHome/>) : (<PatientHome/>)}</>
        );
    }
}

export default HomeLoad;