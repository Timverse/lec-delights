import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // 2. Fetch the API key you saved in the Admin Dashboard!
    const { data: settings } = await supabase
      .from('site_settings')
      .select('resend_api_key, resend_from_email')
      .eq('id', 'global_config')
      .single();

    const apiKey = settings?.resend_api_key;

    if (!apiKey) {
      console.log("No Resend API key found in Admin Dashboard. Skipping email notification.");
      // We return success: true anyway so the user's form still says "Message Sent"
      // because we still saved their message to Supabase successfully.
      return NextResponse.json({ success: true, note: 'Saved to DB, but no email sent (Missing API Key)' });
    }

    // 3. Initialize Resend INSIDE the function so it doesn't crash on startup
    const resend = new Resend(apiKey);

    const body = await req.json();
    const { firstName, lastName, email, phone, message } = body;

    // 4. Use the email from the Admin Dashboard, or fallback to the testing email
    const fromEmail = settings?.resend_from_email || 'Contact Form <onboarding@resend.dev>';

    // 5. Send the email
    const { data, error } = await resend.emails.send({
      from: fromEmail, 
      to: 'timverse.io@gmail.com', // MUST MATCH YOUR RESEND LOGIN EMAIL WHILE TESTING
      subject: `New Inquiry from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>New Message from Lec Delights Website</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <hr style="border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
      `
    });

    if (error) {
      console.error("Resend API rejected the email:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Major API Route Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}