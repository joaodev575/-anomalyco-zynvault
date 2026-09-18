"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Seeding database...");
    // Create admin user
    const adminPassword = await bcryptjs_1.default.hash("Admin123!", 12);
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
    const testPassword = await bcryptjs_1.default.hash("Test123!", 12);
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
//# sourceMappingURL=seed.js.map