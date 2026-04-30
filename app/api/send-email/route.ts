import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// 1. Connect to Supabase to read the Admin settings
const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const order = await request.json();

    // 2. Fetch the live Email Settings from the Admin Dashboard!
    const { data: settings } = await supabase
      .from('site_settings')
      .select('resend_api_key, resend_from_email')
      .eq('id', 'global_config')
      .single();

    // Safety Check: If the owner left the API key blank in the dashboard, skip sending the email.
    if (!settings || !settings.resend_api_key) {
      console.log('No Resend API Key found in Admin Dashboard. Email skipped.');
      return NextResponse.json({ success: true, note: 'No API key provided' });
    }

    // 3. Initialize Resend using the dynamically loaded key
    const resend = new Resend(settings.resend_api_key);
    
    // Use their custom "From" email, or default to the sandbox one
    const fromEmail = settings.resend_from_email || 'Lec Delights <onboarding@resend.dev>';

    // 4. Send the Customer Receipt
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [order.email], // Sends to the customer
      subject: `Order Confirmed! 🌿 - Lec Delights`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #7fae45; text-align: center;">Thank you for your order, ${order.customer_name}!</h2>
          <p style="text-align: center; color: #666;">We've received your order and are getting it ready for dispatch.</p>
          
          <div style="background-color: #fafaf9; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <h3 style="margin-top: 0; border-bottom: 2px solid #7fae45; padding-bottom: 10px;">Order Summary</h3>
            <p><strong>Order ID:</strong> #${order.id ? order.id.slice(0,8).toUpperCase() : 'NEW'}</p>
            <p><strong>Total Amount Paid:</strong> ₹${order.total}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
            
            <h4 style="margin-bottom: 5px;">Shipping To:</h4>
            <p style="margin-top: 0; color: #555; line-height: 1.5;">
              ${order.address}<br/>
              ${order.city}, ${order.state} - ${order.pincode}
            </p>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #888; text-align: center;">
            If you have any questions about your order, simply reply to this email!
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}