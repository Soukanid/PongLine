import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "..", "..", "data", "game.sqlite");

export const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
  }
);
