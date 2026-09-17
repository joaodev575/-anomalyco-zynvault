import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@zynvault.app" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@zynvault.app",
      password: adminPassword,
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create test user
  const testPassword = await bcrypt.hash("Test123!", 12);
  const testUser = await prisma.user.upsert({
    where: { email: "test@zynvault.app" },
    update: {},
    create: {
      name: "Test User",
      email: "test@zynvault.app",
      password: testPassword,
      role: "USER",
      isEmailVerified: true,
    },
  });

  console.log("✅ Test user created:", testUser.email);

  console.log("\n📦 Seed completed successfully!");
  console.log("\n📋 Test credentials:");
  console.log("   Admin: admin@zynvault.app / Admin123!");
  console.log("   User:  test@zynvault.app / Test123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });