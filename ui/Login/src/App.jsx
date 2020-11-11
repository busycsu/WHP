import React from "react";
import './App.scss';
import {Login,Register} from "./components/login";
import logo from "./vectors/logo.png"
import Sidebar from './components/login/sidebar';

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      onLoginState:true,
      expanded: true,
      activeKey: '1',
    };
    this.handleToggle = this.handleToggle.bind(this);
    this.handleSelect = this.handleSelect.bind(this);

  }
  handleToggle() {
    this.setState({
      expanded: !this.state.expanded
    });
  }
  handleSelect(eventKey) {
    this.setState({
      activeKey: eventKey
    });
  }

  componentDidMount() {
    this.rightSide.classList.add("right");
  }

  changeState() {
    const { onLoginState } = this.state;
    if (onLoginState) {
      this.rightSide.classList.remove("right");
      this.rightSide.classList.add("left");
    } else {
      this.rightSide.classList.remove("left");
      this.rightSide.classList.add("right");
    }
    this.setState(prevState => ({ onLoginState: !prevState.onLoginState }));
  }

  render(){
    const {onLoginState}  = this.state;
    const { expanded } = this.state;
    const current = onLoginState ? "Register" : "Login";
    const currentActive = onLoginState? "login":"register";
    return (
      <div className="body">        
        <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
        <div className="bg">
        <div className="logo">
          <img src={logo} />
        </div>
        <div className="App">            
          <div className="login">          
            <div className="container" ref={ref => (this.container = ref)}>
              {onLoginState && (<Login containerRef={ref => (this.current = ref)} />)}
              {!onLoginState && (<Register containerRef={ref => (this.current = ref)} />)}
            </div>
            <RightSide current={current} currentActive={currentActive} containerRef={ref => (this.rightSide = ref)} onClick={this.changeState.bind(this)}/> 
          </div>
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

const RightSide = props => {
  return (
    <div className="right-side" ref={props.containerRef} onClick={props.onClick}>
      <div className="inner-container">
        <div className="text">{props.current}</div>
      </div>
    </div>
  );
};

export default App;
