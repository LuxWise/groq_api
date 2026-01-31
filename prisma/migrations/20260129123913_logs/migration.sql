-- CreateTable
CREATE TABLE "api_logs" (
    "id" SERIAL NOT NULL,
    "level" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "httpMethod" TEXT,
    "httpUrl" TEXT,
    "requestHeaders" TEXT NOT NULL,
    "requestBody" TEXT,
    "responseStatus" TEXT,
    "responseHeaders" TEXT,
    "responseBody" TEXT,
    "responseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_logs_pkey" PRIMARY KEY ("id")
);
