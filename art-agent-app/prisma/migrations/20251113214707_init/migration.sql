-- CreateTable
CREATE TABLE "RSSFeed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "summary" TEXT,
    "publishedDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedId" INTEGER NOT NULL,
    CONSTRAINT "NewsArticle_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "RSSFeed" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RSSFeed_name_key" ON "RSSFeed"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RSSFeed_url_key" ON "RSSFeed"("url");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_link_key" ON "NewsArticle"("link");
