import { napaDB } from "../index";

class Event {
  static getAllEvents(status) {
    try {
      const sql = `SELECT * FROM events WHERE status = "${status}" ORDER BY updatedAt DESC`;

      return napaDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getEvent(eventId) {
    try {
      const sql = `SELECT * FROM events WHERE eventId = "${eventId}"`;

      return napaDB.execute(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default Event;
