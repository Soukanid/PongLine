import { db } from "./database"

// [soukaina]  add await async after learning it :)

export const createTables = () => {
  db.serialize(() => {
  
    db.run(
      `CREATE TABLE IF NOT EXISTS chat 
      (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        delivered BOOLEAN NOT NULL,
        read BOOLEAN NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `,
      (err) => {
        if (err)
          console.error(err.message);
      });
  });
};

createTables();
