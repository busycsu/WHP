import React from "react";
import {credential} from '../aws/aws-credential';

const crypto = require('crypto'); // tot sign our pre-signed URL
const mic = require('microphone-stream');
const v4 = require('../aws/aws-signature-v4'); // to generate our pre-signed URL
const audioUtils = require('../aws/audioUtils'); 
const marshaller = require("@aws-sdk/eventstream-marshaller"); // for converting binary event stream messages to and from JSON
const util_utf8_node = require("@aws-sdk/util-utf8-node"); // utilities for encoding and decoding UTF8

const eventStreamMarshaller = new marshaller.EventStreamMarshaller(util_utf8_node.toUtf8, util_utf8_node.fromUtf8);

let inputSampleRate;
let micStream;
let languageCode = "en-US";
let sampleRate = 16000;
let region = "us-west-2";
let starttog = false;
let stoptog = true;
let socket;
let transcribeException = false;
let socketError = false;
// let transcription = "";


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
class Trans extends React.Component{
  constructor(props){
    super(props);
    this.state = {
        transcription : ""
        
    }
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
    if (languageCode == "en-US" || languageCode == "es-US")
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
            'key': credential.accessKeyId,
            'secret': credential.secretAccessKey,
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
                        console.log("this is",this)
                        this.setState({
                            transcription: this.state.transcription+transcript + "\n"
                        })
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
            if (closeEvent.code != 1000) {
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

    let sampleRate = 0;

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

  componentDidMount() {
    // this.state.cls_trans = transcription;
    console.log("component did mount")
  }
  componentWillMount() {
    // this.state.cls_trans = transcription;
    console.log("component will mount")
  }


 

  render(){
    return (
      <div>
        <h1>
            Real-time Audio Transcription
        </h1>

        
        {/* <textarea id="transcript" placeholder="Press Start and speak into your mic"  value= {this.state.cls_trans} rows="5"
            readonly="readonly"></textarea> */}
            <p>{this.state.transcription}</p>
            {/* <input type="text" value={this.state.cls_trans} onChange={this.handleChange}/>
                <h4>{this.state.cls_trans}</h4> */}
        <div class="row">
            <div class="col">
                <button id="start-button" class="button-xl" title="Start Transcription" onClick={this.start_button_click}>
                    <i class="fa fa-microphone"></i> Start
                </button>
                <button id="stop-button" class="button-xl" title="Stop Transcription" onClick={this.stop_button_click}><i
                        class="fa fa-stop-circle"></i> Stop
                </button>
                <button id="reset-button" class="button-xl button-secondary" title="Clear Transcript" onClick={this.clear_transcript}> 
                    Clear Transcript
                </button>
            </div>
            
            {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
            <script src="../../transcription_dist/amazon-transcribe-websocket-static/dist/main.js"></script> */}
        </div>

      </div>
    );
    
  }

}



export default Trans;