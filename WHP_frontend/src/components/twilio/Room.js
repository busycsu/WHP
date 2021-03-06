import React, { useEffect, useState } from "react";
import Participant from "./Participant";
import Trans from "../aws/trans"
import "./Room.css";
import '../login/home.scss'

const Room = ({ roomName, room, handleLogout }) => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const participantConnected = (participant) => {
      setParticipants((prevParticipants) => [...prevParticipants, participant]);
    };

    const participantDisconnected = (participant) => {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      );
    };

    room.on("participantConnected", participantConnected);
    room.on("participantDisconnected", participantDisconnected);
    room.participants.forEach(participantConnected);
    return () => {
      room.off("participantConnected", participantConnected);
      room.off("participantDisconnected", participantDisconnected);
    };
  }, [room]);

  const remoteParticipants = participants.map((participant) => (
    <Participant key={participant.sid} participant={participant} />
  ));

  return (
    
    <div>
      
      <div className="videopage_msg" id="video_msg">Room: {roomName} </div>
      <div className="room">

          <div className="room_item1" id="localuser" style={{width:"35%"}}>
            <div className="local-participant">
            {room ? (<div>
              <Participant
                key={room.localParticipant.sid}
                participant={room.localParticipant}
              /></div>) : ("")}
              
            </div>

            <div className="remote-participants" style={{color:"rgb(199, 216, 216)"}}><h3>Remote Participants</h3>{remoteParticipants}</div>
          </div>

          <div className="room_item1" style={{width:"65%"}}>
            
            <Trans />
          </div>   
          <div className="room_item">
            <button onClick={handleLogout}>Quit Room</button>
          </div>
      </div>
    </div>
    
  );
};

export default Room;
