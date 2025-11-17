/*
  Warnings:

  - Made the column `newsDate` on table `NewsArticle` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NewsArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "summary" TEXT,
    "newsDate" DATETIME NOT NULL,
    "insertedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedId" INTEGER NOT NULL,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RAW',
    CONSTRAINT "NewsArticle_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "RSSFeed" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_NewsArticle" ("createdAt", "feedId", "id", "insertedAt", "link", "newsDate", "summary", "tags", "title") SELECT "createdAt", "feedId", "id", "insertedAt", "link", "newsDate", "summary", "tags", "title" FROM "NewsArticle";
DROP TABLE "NewsArticle";
ALTER TABLE "new_NewsArticle" RENAME TO "NewsArticle";
CREATE UNIQUE INDEX "NewsArticle_link_key" ON "NewsArticle"("link");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
