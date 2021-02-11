import React from 'react'
import fire from '../../contexts/AuthContext'
import Sidebar from './sidebar';
import logo from "../../vectors/logo.png"
import "./home.scss"
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import axios from 'axios';
import ReactModal from 'react-modal';
import DoctorPage from './doctor_home';
import VideoChat from '../twilio/VideoChat'

class VideoPage extends React.Component {
    
    constructor(props){
        super(props);
    }

 
    componentDidMount(){
    } 

    render(){  
        return (
            <Router>
            <div className="body">
                
                <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />

                <div className="bg">
                    <div className="logo">
                    <Link to="/" >
                        <img src={logo} /></Link>
                    </div>

                    <div className="homye_body" style={{marginLeft:"auto"},{marginRight:"auto"},{height:"100%"}}>
                        <div className="button-container" style={{height:"100%"}}>
                            <div className="video">
                                <div className="videoarea">
                                    <VideoChat/>
                                </div>
                                
                            </div>
                                
                            <div className="button-canvas">
                            </div>

                        </div>

                    </div>
            

                </div>
                       
            </div>
            
            </Router>
        )
    }
}

export default VideoPage;