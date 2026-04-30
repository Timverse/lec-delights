import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { order, newStatus } = await request.json();

    // 1. Fetch the live Email Settings from the Admin Dashboard
    const { data: settings } = await supabase
      .from('site_settings')
      .select('resend_api_key, resend_from_email')
      .eq('id', 'global_config')
      .single();

    if (!settings || !settings.resend_api_key) {
      return NextResponse.json({ success: true, note: 'No API key provided' });
    }

    const resend = new Resend(settings.resend_api_key);
    const fromEmail = settings.resend_from_email || 'onboarding@resend.dev';

    // 2. Customize the email design based on the status!
    let subject = '';
    let headline = '';
    let message = '';
    let color = '#7fae45'; // default green

    if (newStatus === 'Processing') {
      subject = `Your order is being prepared! 📦`;
      headline = `We're packing your order!`;
      message = `We are currently getting your items ready for dispatch.`;
      color = '#eab308'; // yellow
    } else if (newStatus === 'Shipped') {
      subject = `Your order has shipped! 🚚`;
      headline = `It's on the way!`;
      message = `Great news! Your order has been handed over to our delivery partners and is on its way to you.`;
      color = '#3b82f6'; // blue
    } else if (newStatus === 'Delivered') {
      subject = `Your order has been delivered! 🎉`;
      headline = `Delivered!`;
      message = `Your package has arrived! Thank you for shopping with us, we hope you love your items.`;
      color = '#22c55e'; // green
    } else if (newStatus === 'Cancelled') {
      subject = `Your order has been cancelled. ❌`;
      headline = `Order Cancelled`;
      message = `Your order has been successfully cancelled. If you have any questions, please reply to this email.`;
      color = '#ef4444'; // red
    } else {
      subject = `Order Update: ${newStatus}`;
      headline = `Order Status Updated`;
      message = `The status of your order has been changed to: ${newStatus}.`;
    }

    // 3. Send the Email
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [order.email], // Sends to the customer
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: ${color}; text-align: center;">${headline}</h2>
          <p style="text-align: center; color: #444; font-size: 16px;">Hi ${order.customer_name},</p>
          <p style="text-align: center; color: #666; font-size: 16px; line-height: 1.5;">${message}</p>
          
          <div style="background-color: #fafaf9; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
            <p style="margin: 0; color: #888;">Order ID: <strong>#${order.id.slice(0,8).toUpperCase()}</strong></p>
          </div>
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
    return NextResponse.json({ error: 'Failed to send status email' }, { status: 500 });
  }
}