import { execSync } from "child_process";

if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL detected. Synchronizing database schema and seeding products...");
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
    console.log("Database setup and seeding completed successfully.");
  } catch (error) {
    console.warn("Database initialization warning (will continue build):", error instanceof Error ? error.message : error);
  }
} else {
  console.log("No DATABASE_URL set. Skipping database push & seed step.");
}
