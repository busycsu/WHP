import React from "react";
import "./Lobby.css"

const Lobby = ({
  username,
  handleUsernameChange,
  roomName,
  handleRoomNameChange,
  handleSubmit,
  connecting,
}) => {
  return (
     <div id="div"> 
        <div className="videopage_msg" id="video_msg">Enter A Room </div>
       <form className="room_form"onSubmit={handleSubmit} autoComplete="off">
      <div>
        <br></br>
        <input
          type="text"
          id="field"
          placeholder="Name"
          value={username}
          onChange={handleUsernameChange}
          readOnly={connecting}
          required
        />
      </div>

      <div>
        <br></br>
        <input
          type="text"
          id="room"
          placeholder="Room Name"
          value={roomName}
          onChange={handleRoomNameChange}
          readOnly={connecting}
          required
        />
      </div>
      <br></br>
      <button type="submit" className="joinRoom"disabled={connecting}>
        {connecting ? "Connecting" : "Join"}
      </button>
    </form>
     </div>
    
  );
};

export default Lobby;
