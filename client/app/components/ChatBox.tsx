import React from "react";

const ChatBox = ({ sendMessage, message, setMessage }: any) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;

