import { prisma } from "./prisma";

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({ data: params });
}

export async function notifyPaymentReceived(tenantId: string, amount: number, buildingName: string) {
  return createNotification({
    userId: tenantId,
    type: "payment",
    title: "Payment Received",
    message: `Your payment of $${amount.toFixed(2)} for ${buildingName} has been recorded.`,
    link: "/finances/payments",
  });
}

export async function notifyInvoiceCreated(tenantId: string, invoiceNumber: string, amount: number) {
  return createNotification({
    userId: tenantId,
    type: "invoice",
    title: "New Invoice",
    message: `Invoice ${invoiceNumber} for $${amount.toFixed(2)} has been created.`,
    link: "/finances/invoices",
  });
}

export async function notifyBookingConfirmed(userId: string, slotName: string, date: string) {
  return createNotification({
    userId,
    type: "booking",
    title: "Booking Confirmed",
    message: `Your booking for ${slotName} on ${date} has been confirmed.`,
    link: "/calendar",
  });
}
