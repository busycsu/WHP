import React from 'react'
import fire from '../../contexts/AuthContext'

class Home extends React.Component {

    logOut(){
        fire.auth().signOut();
    }
    render(){
        return (
            <div>
                <h1> You are logged in..</h1>
                <button onClick={ this.logOut }>Logout</button>
            </div>
        )
    }
}

export default Home;