#!/usr/bin/env node
/**
 * Seed script to create an initial ADMIN user.
 *
 * Usage (from project root):
 *   node ./tools/prisma/seed-admin.js
 *
 * Optional env vars:
 *   SEED_ADMIN_EMAIL (default: admin@example.com)
 *   SEED_ADMIN_USERNAME (default: admin)
 *   SEED_ADMIN_NAME (default: Administrator)
 *   SEED_ADMIN_PASSWORD (default: changeme123)
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@ei.com";
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const name = process.env.SEED_ADMIN_NAME || "Administrator";
  const password = process.env.SEED_ADMIN_PASSWORD || "changemeEi12345";

  console.log(`Seeding admin user (${email})...`);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username,
      provider: "email",
      emailVerified: true,
      role: "ADMIN",
      secrets: {
        create: {
          password: hashed,
          lastSignedIn: new Date(),
        },
      },
    },
  });

  console.log("Created admin user:", { id: user.id, email: user.email, username: user.username });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
