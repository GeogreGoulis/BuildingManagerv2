import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Wallet, CalendarDays } from "lucide-react";
import type { Role } from "@/generated/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  const role = (user as { role: Role })?.role;

  // Fetch summary data
  const [buildingCount, tenantCount, recentPayments, upcomingBookings] =
    await Promise.all([
      prisma.building.count(
        role === "MANAGER" ? { where: { managerId: user?.id } } : undefined
      ),
      prisma.user.count({ where: { role: "TENANT", isActive: true } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.booking.count({
        where: {
          startTime: { gte: new Date() },
          cancelled: false,
        },
      }),
    ]);

  const cards = [
    {
      title: "Buildings",
      value: String(buildingCount),
      icon: Building2,
    },
    {
      title: "Active Tenants",
      value: String(tenantCount),
      icon: Users,
    },
    {
      title: "Monthly Payments",
      value: `$${(recentPayments._sum.amount || 0).toFixed(2)}`,
      icon: Wallet,
    },
    {
      title: "Upcoming Bookings",
      value: String(upcomingBookings),
      icon: CalendarDays,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Welcome, {user?.name}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
