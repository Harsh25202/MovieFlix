export const config = {
  // Use dummy data in preview, MongoDB when deployed
  isDevelopment: typeof window !== "undefined" || process.env.NODE_ENV === "development",
  mongoUri: process.env.MONGODB_URI || "",
  mongoDbName: process.env.MONGODB_DB_NAME || "movieflix",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
}
