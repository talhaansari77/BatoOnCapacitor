import { createClientFromRequest } from "npm:@base44/sdk";
Deno.serve(async req => {
  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me();
    if (!user?.email) return Response.json({error: "Sign in first."}, {status: 401});
    const {order_id} = await req.json();
    if (typeof order_id !== "string") return Response.json({error: "Choose an order."}, {status: 400});
    const entities = client.asServiceRole.entities;
    const order = await entities.Order.get(order_id);
    if (!order || order.client_email !== user.email) return Response.json({error: "Order not found."}, {status: 404});
    if (order.status === "cancelled") return Response.json({order});
    // Legacy reservations need shop reconciliation. Never silently add stock.
    const changed = await entities.Order.updateMany({
      id: order_id, client_email: user.email, status: "pending",
      payment_status: "unpaid", inventory_status: "not_reserved"
    }, {status: "cancelled", cancelled_at: new Date().toISOString()});
    if (changed.updated !== 1) return Response.json({error: "This order cannot be cancelled here. Contact the shop team."}, {status: 409});
    return Response.json({order: await entities.Order.get(order_id)});
  } catch { return Response.json({error: "Cancellation couldn't be confirmed. Refresh your orders before retrying."}, {status: 500}); }
});
