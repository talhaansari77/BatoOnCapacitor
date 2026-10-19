import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only allow admins to promote other users
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // List all users to find the one with matching email
    const users = await base44.asServiceRole.entities.User.list('', 1000);
    const targetUser = users.find(u => u.email === email);

    if (!targetUser) {
      return Response.json({ error: `User with email ${email} not found` }, { status: 404 });
    }

    // Update user role to admin
    const result = await base44.asServiceRole.entities.User.update(targetUser.id, {
      role: 'admin'
    });

    return Response.json({ success: true, message: `User ${email} is now an admin`, user: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});