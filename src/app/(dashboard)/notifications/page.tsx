"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const json = await fetch("/api/notifications").then((r) => r.json());
    setNotifications(json.data || []);
    setLoading(false);
  }

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    fetchNotifications();
  }

  async function markRead(id: string) {
    await fetch("/api/notifications/read", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds: [id] }),
    });
    fetchNotifications();
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <div className="animate-pulse">Loading notifications...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge>{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => (
          <Card key={notif.id} className={notif.isRead ? "opacity-60" : ""}>
            <CardContent className="flex items-start gap-3 py-3">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{notif.title}</p>
                  <Badge variant="outline" className="text-xs">{notif.type}</Badge>
                  {!notif.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(notif.createdAt).toLocaleString()}</span>
                  {notif.link && (
                    <Link href={notif.link} className="text-primary hover:underline">View</Link>
                  )}
                  {!notif.isRead && (
                    <button onClick={() => markRead(notif.id)} className="text-primary hover:underline">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
