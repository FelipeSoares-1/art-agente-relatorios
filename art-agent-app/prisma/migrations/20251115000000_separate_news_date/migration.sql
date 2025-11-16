-- Adicionar nova coluna para data da notícia
ALTER TABLE "NewsArticle" ADD COLUMN "newsDate" DATETIME;

-- Copiar as datas existentes de publishedDate para newsDate
UPDATE "NewsArticle" SET "newsDate" = "publishedDate";

-- Renomear publishedDate para insertedAt para deixar mais claro
ALTER TABLE "NewsArticle" RENAME COLUMN "publishedDate" TO "insertedAt";