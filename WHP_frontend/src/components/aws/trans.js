import React from "react";
import {credential} from '../../contexts/aws-credential';
import AWS, { Discovery } from 'aws-sdk';
import fire from '../../contexts/AuthContext'
import { type } from "os";
import axios from 'axios'
import './trans.css'
import hightlighter from "react-highlight-words"
import Highlighter from "react-highlight-words";

const crypto = require('crypto'); // tot sign our pre-signed URL
const mic = require('microphone-stream');
const v4 = require('../aws/aws-signature-v4'); // to generate our pre-signed URL
const audioUtils = require('../aws/audioUtils'); 
const marshaller = require("@aws-sdk/eventstream-marshaller"); // for converting binary event stream messages to and from JSON
const util_utf8_node = require("@aws-sdk/util-utf8-node"); // utilities for encoding and decoding UTF8


const eventStreamMarshaller = new marshaller.EventStreamMarshaller(util_utf8_node.toUtf8, util_utf8_node.fromUtf8);
// for comprehend
console.log("credential before created", credential)
const comprehendMedical = new AWS.ComprehendMedical(credential);
console.log(comprehendMedical)


let inputSampleRate;
let micStream;
let languageCode = "en-US";
let sampleRate = 16000;
let region = "us-west-2";

let socket;
let transcribeException = false;
let socketError = false;
// let transcription = "";

// transcription helper function
function convertAudioToBinaryMessage(audioChunk) {
    let raw = mic.toRaw(audioChunk);

    if (raw == null)
        return;

    // downsample and convert the raw audio bytes to PCM
    let downsampledBuffer = audioUtils.downsampleBuffer(raw, inputSampleRate, sampleRate);
    let pcmEncodedBuffer = audioUtils.pcmEncode(downsampledBuffer);

    // add the right JSON headers and structure to the message
    let audioEventMessage = getAudioEventMessage(Buffer.from(pcmEncodedBuffer));

    //convert the JSON object + headers into a binary event stream message
    let binary = eventStreamMarshaller.marshall(audioEventMessage);

    return binary;
}

// transcription helper function
function getAudioEventMessage(buffer) {
    // wrap the audio data in a JSON envelope
    return {
        headers: {
            ':message-type': {
                type: 'string',
                value: 'event'
            },
            ':event-type': {
                type: 'string',
                value: 'AudioEvent'
            }
        },
        body: buffer
    };
}

// comprehension helper function
function detectEntity(text) {
    console.log('start!!!!!!!!!!!');
    if(text === undefined || text.replace(/\s/g,"") === ""){
        // Transcript is empty, nothing to detect, also CompMed would through exception
        return [];
    }
    //clients can be shared by different commands
    const params = {
        Text: text,
    };

    console.log(`Send text ${text} to comprehend medical`);
    return new Promise((resolve, reject) => {
        comprehendMedical.detectEntitiesV2(params, function (err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
                reject(err);
            }
            else     {
                // console.log(data);           // successful response
                resolve(data);
            }
        })
    });
}
// store report in the database helper function
function storeReport(len, result, uid){
    var currentdate = new Date(); 
    var datetime = (currentdate.getMonth()+1) + "/"
            + currentdate.getDate()  + "/" 
            + currentdate.getFullYear() + " @ "  
            + currentdate.getHours() + ":"  
            + currentdate.getMinutes() + ":" 
            + currentdate.getSeconds();
    var date = Date.now()
    var path = "users/"+uid+"/report/"+date;
    var userRef = fire.database().ref().child(path);
    userRef.set({
        "datetime":datetime,
    })
    var contentPath = path+"/content";
    
    
    for(var i = 0; i<len; i++){
        var Term = result.Entities[i].Text;
        var Category = result.Entities[i].Category;
        var Type = result.Entities[i].Type;
        var Score = result.Entities[i].Score;
        var Traits = result.Entities[i].Traits;
        var contentRef = fire.database().ref().child(contentPath+"/"+i);
        contentRef.set({
            Term:Term,
            Category:Category,
            Type:Type,
            Score:Score,
            Traits:Traits
        })
        
    }
}

async function generateDoctorReport(){
    const data = await fetch("/uid")
        .then((res) => 
          res.json()
        ).then(function(responseJson){
            return responseJson.id
        })
    console.log(data)
  }


class Trans extends React.Component{
  constructor(props){
    super(props);
    this.state = {
        // transcription : "doctor: Good evening. You look pale and your voice is out of tune.\n \
        // patient: Yes doctor. I'm running a temperature and have a sore throat.\n \
        // doctor: Do you get sweating and shivering?\n\
        // patient: Not sweating, but I feel somewhat cold when I sit under a fan.\n \
        // doctor: OK. You’ve few symptoms of malaria. I would suggest you undergo blood test. ",
        transcription : "",
        userType : "",
        startHighlight : false,
        ifExplain : false,
        
    }
    this.transRef = React.createRef();

    this.start_button_click = this.start_button_click.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.setRegion = this.setRegion.bind(this);
    this.streamAudioToWebSocket = this.streamAudioToWebSocket.bind(this);
    this.closeSocket = this.closeSocket.bind(this);
    // this.getAudioEventMessage = this.getAudioEventMessage.bind(this);
    // this.handleEventStreamMessage = this.handleEventStreamMessage.bind(this);
    this.createPresignedUrl = this.createPresignedUrl.bind(this);
    // this.convertAudioToBinaryMessage = this.convertAudioToBinaryMessage.bind(this);
    this.wireSocketEvents = this.wireSocketEvents.bind(this);
    this.stop_button_click = this.stop_button_click.bind(this);
  }
  start_button_click(){
    console.log("start is pressed");
    // $('#error').hide(); // hide any existing errors
    // this.toggleStartStop(true); // disable start and enable stop button

    // set the language and region from the dropdowns
    this.setLanguage();
    this.setRegion();

    // first we get the microphone input from the browser (as a promise)...
    window.navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        })
        // ...then we convert the mic stream to binary event stream messages when the promise resolves 
        .then(this.streamAudioToWebSocket) 
        // .catch(function (error) {
        //     // showError('There was an error streaming your audio to Amazon Transcribe. Please try again.');
        //     // this.toggleStartStop(false);
        //     console.log("error!!!")
        // });
  }
  
stop_button_click(){
    this.closeSocket();
}
setLanguage(){
    console.log('set language');
    if (languageCode === "en-US" || languageCode === "es-US")
        // sampleRate = 44100;
        sampleRate = 16000;
    else
        sampleRate = 8000;
    console.log("sample rate:",sampleRate)
}

setRegion(){
    console.log('set Region');
    region = "us-west-2";
}

createPresignedUrl() {
    console.log("in presigned");
    let endpoint = "transcribestreaming." + region + ".amazonaws.com:8443";

    console.log(credential.accessKeyId)
    console.log(credential.secretAccessKey)

    // get a preauthenticated URL that we can use to establish our WebSocket
    
    return v4.createPresignedURL(
        'GET',
        endpoint,
        '/medical-stream-transcription-websocket',
        'transcribe',
        crypto.createHash('sha256').update('', 'utf8').digest('hex'), 
        {
            // 'key': $('#access_id').val(),
            // 'secret': $('#secret_key').val(),
            'key': process.env.REACT_APP_AWS_ACCESS_KEY_ID,
            'secret': process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
            // 'key': process.env.AWS_ACCESS_KEY_ID,
            // 'secret': process.env.AWS_SECRET_ACCESS_KEY,
            // 'sessionToken': $('#session_token').val(),
            'sessionToken': "",
            'protocol': 'wss',
            'expires': 15,
            'region': region,
            'query': "language-code=" + languageCode + "&media-encoding=pcm&sample-rate=" + sampleRate
        }
    );
}





wireSocketEvents() {
    // handle inbound messages from Amazon Transcribe
    socket.onmessage = (message) => {
        //convert the binary event stream message to JSON
        let messageWrapper = eventStreamMarshaller.unmarshall(Buffer(message.data));
        // console.log("message",message);
        let messageBody = JSON.parse(String.fromCharCode.apply(String, messageWrapper.body));
        // console.log("messagebody",messageBody);
        if (messageWrapper.headers[":message-type"].value === "event") {
            // let results = messageJson.Transcript.Results;
            let results = messageBody.Transcript.Results;
            if (results.length > 0) {
                if (results[0].Alternatives.length > 0) {
                    let transcript = results[0].Alternatives[0].Transcript;

                    // fix encoding for accented characters
                    transcript = decodeURIComponent(escape(transcript));

                    // update the textarea with the latest result
                    // $('#transcript').val(transcription + transcript + "\n");
                    // this.setState({
                    //     transcription: this.state.transcription+transcript + "\n"
                    // })
                    console.log(this.state.transcription + transcript + "\n")
                    // if this transcript segment is final, add it to the overall transcription
                    if (!results[0].IsPartial) {
                        //scroll the textarea down
                        // $('#transcript').scrollTop($('#transcript')[0].scrollHeight);
                        // console.log("this is",this)
                        var date = Date.now()
                        var sentence = transcript + "\n";
                        console.log("user type", this.state.userType);
                        if(sentence !== ""){
                            var path = "Buffer/"+date;
                            var userRef = fire.database().ref().child(path);
                            userRef.set({
                                type: this.state.userType,
                                sentence : sentence

                            })
                        }
                        // this.setState({
                        //     transcription: this.state.transcription+transcript + "\n"
                        // })
                        // this.state.transcription += transcript + "\n";
                    }
                }
            }
            // this.handleEventStreamMessage(messageBody);
        }
        else {
            transcribeException = true;
            console.log(messageBody.Message)
            // showError(messageBody.Message);
            // toggleStartStop();
        }
    };

    socket.onerror = function () {
        socketError = true;
        console.log('WebSocket connection error. Try again.')
        // showError('WebSocket connection error. Try again.');
        // toggleStartStop();
    };
    
    socket.onclose = function (closeEvent) {
        micStream.stop();
        
        // the close event immediately follows the error event; only handle one.
        if (!socketError && !transcribeException) {
            if (closeEvent.code !== 1000) {
                console.log("Streaming Exception!!")
                // showError('</i><strong>Streaming Exception</strong><br>' + closeEvent.reason);
            }
            // toggleStartStop();
        }
    };
}

// handleEventStreamMessage(messageJson) {
    
// }

closeSocket = function () {
    if (socket.readyState === socket.OPEN) {
        micStream.stop();

        // Send an empty frame so that Transcribe initiates a closure of the WebSocket after submitting all transcripts
        let emptyMessage = getAudioEventMessage(Buffer.from(new Buffer([])));
        let emptyBuffer = eventStreamMarshaller.marshall(emptyMessage);
        socket.send(emptyBuffer);
    }
}

streamAudioToWebSocket(userMediaStream){
    console.log("streaming start");
    //let's get the mic input from the browser, via the microphone-stream module
    micStream = new mic();

    micStream.on("format", function(data) {
        inputSampleRate = data.sampleRate;
    });

    micStream.setStream(userMediaStream);

    // Pre-signed URLs are a way to authenticate a request (or WebSocket connection, in this case)
    // via Query Parameters. Learn more: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
    let url = this.createPresignedUrl();

    // //open up our WebSocket connection
    socket = new WebSocket(url);
    socket.binaryType = "arraybuffer";

    // let sampleRate = 0;

    // when we get audio data from the mic, send it to the WebSocket if possible
    socket.onopen = function() {
        micStream.on('data', function(rawAudioChunk) {
            // the audio stream is raw audio bytes. Transcribe expects PCM with additional metadata, encoded as binary
            let binary = convertAudioToBinaryMessage(rawAudioChunk);
            // console.log("binary",binary)
            if (socket.readyState === socket.OPEN)
                socket.send(binary);
        }
    )};

    // handle messages, errors, and close events
    this.wireSocketEvents();
  }
  
  clear_transcript = () =>{
      this.setState({
          transcription: ""
      });
  }

  generateReport = () =>{
    var tr = this.state.transcription;
    // var tr = 'Good evening. You look pale and your voice is out of tune.  Yes doctor. I’m running a temperature and have a sore throat.';
    if(tr !== undefined && tr !== ""){
        let uid = fire.auth().currentUser.uid;
        console.log("uid",uid);
        
        var promise = detectEntity(tr);
        

        promise.then(function(result){
            console.log("data: ",result);
            storeReport(result.Entities.length,result, uid);
            
        }, function(err){
            console.log("err: "+err);
        });
    }else{
        console.log("transcription empty.");
    }
    
  }

  getTerms = () =>{
    // var tr = 'Good evening. You look pale and your voice is out of tune.  Yes doctor. I’m running a temperature and have a sore throat.';
    var tr = this.state.transcription;
    var tmp = this;
    if(tr !== undefined && tr !== ""){
        let uid = fire.auth().currentUser.uid;
        console.log("uid",uid);
        
        var promise = detectEntity(tr);
        

        promise.then(function(result){
            console.log("data: ",result);
            tmp.hightlight(result.Entities.length,result);
            
        }, function(err){
            console.log("err: "+err);
        });
    }else{
        console.log("transcription empty.");
    }
  }

  hightlight = (len, result) =>{
    var tmp = []
    for(var i = 0; i<len; i++){
        var Term = result.Entities[i].Text;
        tmp.push(Term);
    }
    this.setState({
            wordsList: tmp,
            startHighlight: true,
            ifExplain: true
    })
    console.log("list", this.state.wordsList)
  }

  componentDidMount() {
    // this.state.cls_trans = transcription;
    console.log("component did mount")
    console.log("credential", credential)
    // this.cheatingbutton()
    let uid = fire.auth().currentUser.uid;
    let path = 'users/'+uid;
    let dataRefname = fire.database().ref(path);
    dataRefname.on('value', snap=>{
        this.state.userType = snap.child('userType').val();
        console.log(snap.child('userType').val())
        
    })
    
    console.log("userType in mount", this.state.userType);

    this.bufferListner();
    
  }
  cheatingbutton = () => {
    var date = Date.now()
    var sentence = "Good evening. You look pale and your voice is out of tune.";
    var tmpType = "Doctor"
    // var sentence = "Yes doctor. I'm running a temperature and have a sore throat.";
    // var tmpType = "Patient"
    // var sentence = "Do you get sweating and shivering?";
    // var tmpType = "Doctor"
    // var sentence = "Not sweating, but I feel somewhat cold when I sit under a fan.";
    // var tmpType = "Patient"
    // var sentence = "OK. You’ve few symptoms of malaria. I would suggest you undergo blood test.";
    // var tmpType = "Doctor"
    console.log("user type", this.state.userType);
    if(sentence !== ""){
        var path = "Buffer/"+date;
        var userRef = fire.database().ref().child(path);
        userRef.set({
            type: tmpType,
            sentence : sentence

        })
    }
  }

  bufferListner = () =>{
      var ref = fire.database().ref("Buffer");
      var tmp = this;
      ref.on("child_added", function (snapshot, prevChildKey) {
          var sentence = snapshot.val().sentence;
          var person = snapshot.val().type;
          var tmpSentence = person +": "+sentence;
          tmp.setState({
              transcription : tmp.state.transcription+tmpSentence
              
          });

      })
  }

  componentWillMount() {
    // this.state.cls_trans = transcription;
    console.log("component will mount")
  }

  testingBtn =() =>{
    console.log(this.state.transcription);
    const node = this.transRef.current;
    console.log(node.innerHTML);
    var str = this.htmltotext(node.innerHTML);
    console.log("str",str);
    this.setState({
        transcription:str
    })
    console.log("trans",this.state.transcription);

    
  }

  htmltotext = (html) =>{
    var ans = html;
    ans = ans.replaceAll("<div></div>","")
    ans = ans.replaceAll("<div>","");
    ans = ans.replaceAll("</div>","\n");
    ans = ans.replaceAll("&nbsp;","");
    ans = ans.replaceAll("<br>","")
    return ans;
  }
  
  updateText(evt){
      console.log("change detected")
  }
 

  render(){
    const startHighlight = this.state.startHighlight;
    const getExplain = this.state.ifExplain;
    return (
      <div className="top">
        <h1 style={{color:"rgb(199, 216, 216)"}}>
            Real-time Audio Transcription
        </h1>

        
        {/* <textarea id="transcript" placeholder="Press Start and speak into your mic"  value= {this.state.cls_trans} rows="5"
            readonly="readonly"></textarea> */}
            
            {/* <input type="text" value={this.state.cls_trans} onChange={this.handleChange}/>
                <h4>{this.state.cls_trans}</h4> */}
        <div className="row">
            <div className="col">
                <button id="start-button" className="button-xl" title="Start Transcription" onClick={this.start_button_click}>
                    <i className="fa fa-microphone"></i> Start
                </button>
                <button id="stop-button" className="button-xl" title="Stop Transcription" onClick={this.stop_button_click}><i
                        className="fa fa-stop-circle"></i> Stop
                </button>
                <button id="reset-button" className="button-xlbutton-secondary" title="Clear Transcript" onClick={this.clear_transcript}> 
                    Clear Transcript
                </button>
                <button id="get-report" className="button-xlbutton-secondary" title="Get Report" onClick={this.generateReport}> 
                    Get Report
                </button>
                <button id="get-report" className="button-xlbutton-secondary" title="Get Term" onClick={this.getTerms}> 
                    Get Term
                </button>
                <button id="get-report" className="button-xlbutton-secondary" title="Get Term" onClick={this.testingBtn}> 
                    Testing
                </button>
            </div>
            
            {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
            <script src="../../transcription_dist/amazon-transcribe-websocket-static/dist/main.js"></script> */}
        </div>

            <div className="term_explanation">
                <div className="texttranscribe" style = {{textAlign:"left"}} contentEditable="true" ref={this.transRef} onChange={this.updateText}>
                    {/* {this.state.transcription} */}
                    {/* testing */}
                    {this.state.transcription.split("\n").map((i,key) => {
                        // return <div  key={key}>
                        {/* {startHighlight
                            ?<Highlighter 
                                searchWords={this.state.wordsList}
                                autoEscape={true}
                                textToHighlight={i}
                                />
                            :<div classname="transresult" ref={this.transRef} value="this?" onChange={evt => this.updateText(evt)}>{i}</div>
                        } */}
                       return <div>{i}</div>
                        // </div>
                    })}
                </div>
                {getExplain
                ?
                <div className="textexplanation">
                    {"Malaria: a human disease that is caused by sporozoan parasites in the red blood cells, \
                    is transmitted by the bite of anopheline mosquitoes, \
                    and is characterized by periodic attacks of chills and fever"}
                </div>
                :<textarea className="textexplanation"></textarea>
                }
                
                
            </div>

      </div>
    );
    
  }

}



export default Trans;
