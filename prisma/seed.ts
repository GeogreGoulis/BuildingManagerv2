import { PrismaClient, Role } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const RESOURCES_ACTIONS: { resource: string; action: string; description: string }[] = [
  // Users
  { resource: "users", action: "view", description: "View users" },
  { resource: "users", action: "create", description: "Create users" },
  { resource: "users", action: "edit", description: "Edit users" },
  { resource: "users", action: "delete", description: "Delete users" },
  // Buildings
  { resource: "buildings", action: "view", description: "View buildings" },
  { resource: "buildings", action: "create", description: "Create buildings" },
  { resource: "buildings", action: "edit", description: "Edit buildings" },
  { resource: "buildings", action: "delete", description: "Delete buildings" },
  // Apartments
  { resource: "apartments", action: "view", description: "View apartments" },
  { resource: "apartments", action: "create", description: "Create apartments" },
  { resource: "apartments", action: "edit", description: "Edit apartments" },
  { resource: "apartments", action: "delete", description: "Delete apartments" },
  // Tenancies
  { resource: "tenancies", action: "view", description: "View tenancies" },
  { resource: "tenancies", action: "create", description: "Create tenancies" },
  { resource: "tenancies", action: "edit", description: "Edit tenancies" },
  { resource: "tenancies", action: "delete", description: "Delete tenancies" },
  // Expenses
  { resource: "expenses", action: "view", description: "View expenses" },
  { resource: "expenses", action: "create", description: "Create expenses" },
  { resource: "expenses", action: "edit", description: "Edit expenses" },
  { resource: "expenses", action: "delete", description: "Delete expenses" },
  // Payments
  { resource: "payments", action: "view", description: "View payments" },
  { resource: "payments", action: "create", description: "Create payments" },
  { resource: "payments", action: "edit", description: "Edit payments" },
  { resource: "payments", action: "delete", description: "Delete payments" },
  // Invoices
  { resource: "invoices", action: "view", description: "View invoices" },
  { resource: "invoices", action: "create", description: "Create invoices" },
  { resource: "invoices", action: "edit", description: "Edit invoices" },
  { resource: "invoices", action: "delete", description: "Delete invoices" },
  // Calendar Slots
  { resource: "calendar_slots", action: "view", description: "View calendar slots" },
  { resource: "calendar_slots", action: "create", description: "Create calendar slots" },
  { resource: "calendar_slots", action: "edit", description: "Edit calendar slots" },
  { resource: "calendar_slots", action: "delete", description: "Delete calendar slots" },
  // Bookings
  { resource: "bookings", action: "view", description: "View bookings" },
  { resource: "bookings", action: "create", description: "Create bookings" },
  { resource: "bookings", action: "edit", description: "Edit bookings" },
  { resource: "bookings", action: "delete", description: "Delete bookings" },
  // Notifications
  { resource: "notifications", action: "view", description: "View notifications" },
  { resource: "notifications", action: "create", description: "Create notifications" },
  // Roles
  { resource: "roles", action: "view", description: "View role permissions" },
  { resource: "roles", action: "edit", description: "Edit role permissions" },
];

// Default permissions per role (ADMIN gets everything via hardcoded fallback)
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  MANAGER: [
    "users.view",
    "buildings.view", "buildings.create", "buildings.edit", "buildings.delete",
    "apartments.view", "apartments.create", "apartments.edit", "apartments.delete",
    "tenancies.view", "tenancies.create", "tenancies.edit", "tenancies.delete",
    "expenses.view", "expenses.create", "expenses.edit", "expenses.delete",
    "payments.view", "payments.create", "payments.edit", "payments.delete",
    "invoices.view", "invoices.create", "invoices.edit", "invoices.delete",
    "calendar_slots.view", "calendar_slots.create", "calendar_slots.edit", "calendar_slots.delete",
    "bookings.view", "bookings.create", "bookings.edit", "bookings.delete",
    "notifications.view", "notifications.create",
  ],
  OWNER: [
    "users.view",
    "buildings.view",
    "apartments.view",
    "tenancies.view",
    "expenses.view",
    "payments.view",
    "invoices.view",
    "calendar_slots.view",
    "bookings.view", "bookings.create", "bookings.edit", "bookings.delete",
    "notifications.view",
  ],
  ACCOUNTANT: [
    "buildings.view",
    "apartments.view",
    "tenancies.view",
    "expenses.view",
    "payments.view",
    "invoices.view",
    "notifications.view",
  ],
  MAINTENANCE: [
    "buildings.view",
    "apartments.view",
    "calendar_slots.view",
    "bookings.view", "bookings.create",
    "notifications.view",
  ],
  TENANT: [
    "buildings.view",
    "apartments.view",
    "tenancies.view",
    "payments.view",
    "invoices.view",
    "calendar_slots.view",
    "bookings.view", "bookings.create",
    "notifications.view",
  ],
};

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@building.local" },
    update: {},
    create: {
      email: "admin@building.local",
      name: "Admin User",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("Admin user created: admin@building.local / admin123");

  // Create permissions
  for (const perm of RESOURCES_ACTIONS) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: { description: perm.description },
      create: perm,
    });
  }
  console.log(`${RESOURCES_ACTIONS.length} permissions seeded`);

  // Create role permissions
  const allPermissions = await prisma.permission.findMany();
  const permMap = new Map(allPermissions.map((p) => [`${p.resource}.${p.action}`, p.id]));

  for (const [role, permKeys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const key of permKeys) {
      const permId = permMap.get(key);
      if (!permId) {
        console.warn(`Permission not found: ${key}`);
        continue;
      }
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: role as Role, permissionId: permId } },
        update: {},
        create: { role: role as Role, permissionId: permId },
      });
    }
  }
  console.log("Role permissions seeded");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
