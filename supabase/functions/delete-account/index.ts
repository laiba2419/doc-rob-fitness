// Supabase Edge Function: supabase/functions/delete-account/index.ts
//
// Deploy with: supabase functions deploy delete-account
// Needs SUPABASE_SERVICE_ROLE_KEY set as an Edge Function secret
// (Supabase sets SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY automatically
// for you inside Edge Functions -- no manual secret needed for those two).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });
    }

    // Client bound to the CALLER's token -- used only to figure out who they are
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
    }

    // Admin client -- service role key, can bypass RLS and delete the auth user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const userId = user.id;

    // ⚠️ Delete this user's rows from every table that stores their data.
    // If your tables already have `user_id uuid references auth.users(id)
    // on delete cascade`, deleting the auth user below would clean these up
    // automatically -- but deleting explicitly here is safer if any table
    // is missing that cascade rule.
    const tablesToClean = [
      'reminders',
      'user_schedule',
      'user_notifications',
      'user_subscriptions',
      'user_favorites',
      'user_preferences',
      'weight_entries',
      'steps_entries',
      'calorie_entries',
      'orders',
      'profiles',
    ];

    for (const table of tablesToClean) {
      const { error } = await supabaseAdmin.from(table).delete().eq('user_id', userId);
      // profiles table might use `id` instead of `user_id` -- handle both
      if (error && table === 'profiles') {
        await supabaseAdmin.from('profiles').delete().eq('id', userId);
      }
    }

    // Finally, delete the actual auth user (this also invalidates their session)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
