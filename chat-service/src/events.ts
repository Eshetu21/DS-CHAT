import { publishMessage } from "./rabbitmq";

export const sendNewMessageEvent = async (message: any) => {
  await publishMessage({
    type: "new_message",
    data: message,
  });
};

