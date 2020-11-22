import React from 'react'
import fire from '../../contexts/AuthContext'

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
            msg = <div>
                <p>Here is your record</p>
                    <p>Name: {this.state.name}</p>
                    <p>Date of Birth: {this.state.DOB}</p>
            </div>
        } else {
            msg = <p></p>
        }
        return (
            <div>
                <h1> You are logged in..</h1>
                <button onClick={ this.getRecords.bind(this) }>Get Electronic Health Record</button>
                <button onClick={ this.logOut.bind(this) }>Logout</button>
                <button onClick={(e) => (window.location = 'http://localhost:8000')}>Start Transcript!</button>
                <button onClick = {this.helper.bind(this)}>Hide Record</button>
                {msg}
            </div>
        )
    }
}

export default Home;