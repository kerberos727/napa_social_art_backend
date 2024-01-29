import { fcm } from "../index";

export const sendNotification = (deviceToken, title, body, type = 'chat') => {
  const message = {
    to: deviceToken,
    notification: {
      title,
      body,
    },
    data: {
      type
    }
  };
  fcm.send(message, (err, response) => {
    if (err) {
      console.error("Error sending notification:", err);
    } else {
      console.log("Notification sent successfully:", response);
    }
  });
};
