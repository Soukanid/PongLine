import { db } from "./database"


export const createTables = () => {
  db.serialize(() => {
  
    db.run(
      `CREATE TABLE IF NOT EXISTS game
      (
        game_id TEXT PRIMARY KEY,
        left_plr_id TEXT,
        right_plr_id TEXT,
        left_plr_score INTEGER,
        right_plr_score INTEGER,
        total_wins INTEGER,
        total_games INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `,
      (err) => {
        if (err)
          console.error(err.message);
      });
  });
};

createTables();