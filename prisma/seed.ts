import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for super admin
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@cocsaas.com' },
    update: {},
    create: {
      email: 'admin@cocsaas.com',
      username: 'mac_knight141',
      password: hashedPassword,
      displayName: 'Ishara mac_knight141 Lakshitha',
      isPlatformAdmin: true,
      isEmailVerified: true,
    },
  });

  console.log('✅ Created Super Admin:', superAdmin.email);

  // Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cocsaas.com' },
    update: {},
    create: {
      email: 'demo@cocsaas.com',
      username: 'demo_user',
      password: hashedPassword,
      displayName: 'Demo User',
      isPlatformAdmin: false,
      isEmailVerified: true,
    },
  });

  console.log('✅ Created Demo User:', demoUser.email);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });