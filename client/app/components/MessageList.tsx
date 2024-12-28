import React from "react";

const MessageList = ({ messages }: any) => {
  return (
    <div>
      {messages.map((msg: any, idx: number) => (
        <div key={idx}>
          <p>
            <strong>{msg.sender_id}</strong>: {msg.message}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
