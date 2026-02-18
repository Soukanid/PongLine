-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "total_wins" INTEGER NOT NULL DEFAULT 0,
    "total_games" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "room_id" TEXT NOT NULL,
    "username1" TEXT,
    "username2" TEXT,
    "score_plr1" INTEGER,
    "score_plr2" INTEGER,
    "winnerName" TEXT,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tournamentId" INTEGER,
    CONSTRAINT "Match_username1_fkey" FOREIGN KEY ("username1") REFERENCES "Player" ("username") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_username2_fkey" FOREIGN KEY ("username2") REFERENCES "Player" ("username") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "nick_name" TEXT NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    CONSTRAINT "Participant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tour_id" TEXT NOT NULL,
    "tour_name" TEXT NOT NULL,
    "tour_state" TEXT NOT NULL DEFAULT 'Pending',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_username_key" ON "Participant"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_tour_id_key" ON "Tournament"("tour_id");
