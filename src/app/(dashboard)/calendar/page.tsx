"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

interface Slot {
  id: string;
  name: string;
  building: { id: string; name: string };
}

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  slot: { id: string; name: string; building: { name: string } };
  user: { id: string; name: string };
}

export default function CalendarPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

  useEffect(() => {
    Promise.all([
      fetch("/api/calendar/slots").then((r) => r.json()),
      fetch(`/api/calendar/bookings?month=${monthStr}`).then((r) => r.json()),
    ]).then(([s, b]) => {
      setSlots(s.data || []);
      setBookings(b.data || []);
      setLoading(false);
    });
  }, [monthStr]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  async function handleCreateBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const date = fd.get("date") as string;
    const startTime = fd.get("startTime") as string;
    const endTime = fd.get("endTime") as string;

    const body = {
      slotId: fd.get("slotId"),
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      notes: fd.get("notes") || undefined,
    };

    const res = await fetch("/api/calendar/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setFormError(json.error?.message || "Failed to create booking");
      return;
    }
    setShowBookingForm(false);
    const updated = await fetch(`/api/calendar/bookings?month=${monthStr}`).then((r) => r.json());
    setBookings(updated.data || []);
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  function bookingsForDay(day: number) {
    return bookings.filter((b) => {
      const d = new Date(b.startTime).getDate();
      return d === day;
    });
  }

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  if (loading) return <div className="animate-pulse">Loading calendar...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button onClick={() => setShowBookingForm(!showBookingForm)}>
          {showBookingForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showBookingForm ? "Cancel" : "Book Slot"}
        </Button>
      </div>

      {showBookingForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">New Booking</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBooking} className="grid gap-4 sm:grid-cols-2">
              {formError && (
                <div className="col-span-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>
              )}
              <div>
                <Label htmlFor="slotId">Slot</Label>
                <Select id="slotId" name="slotId" required>
                  <option value="">Select slot...</option>
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>{s.building.name} - {s.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" name="startTime" type="time" required />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" name="endTime" type="time" required />
              </div>
              <div className="col-span-full">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" />
              </div>
              <div className="col-span-full">
                <Button type="submit">Create Booking</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-muted/50 p-2 text-center text-xs font-medium">
            {d}
          </div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className="min-h-[80px] bg-card p-1 text-sm"
          >
            {day && (
              <>
                <span className="text-xs font-medium">{day}</span>
                <div className="mt-1 space-y-0.5">
                  {bookingsForDay(day).map((b) => (
                    <div
                      key={b.id}
                      className="truncate rounded bg-primary/10 px-1 py-0.5 text-xs"
                      title={`${b.slot.name} - ${b.user.name}`}
                    >
                      {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                      {b.slot.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Slot list */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">Available Slots</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => (
          <Card key={slot.id}>
            <CardContent className="pt-4">
              <div className="font-medium">{slot.name}</div>
              <Badge variant="outline" className="mt-1">{slot.building.name}</Badge>
            </CardContent>
          </Card>
        ))}
        {slots.length === 0 && (
          <p className="text-muted-foreground">No slots available.</p>
        )}
      </div>
    </div>
  );
}
