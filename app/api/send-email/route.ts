import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vyqwkijpuehlqwkspdwc.supabase.co';
const supabaseKey = 'sb_publishable_dx3ou74Ln8ygmQ6bPHdNvw_v4tuuRfo';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const order = await request.json();

    const { data: settings } = await supabase
      .from('site_settings')
      .select('resend_api_key, resend_from_email')
      .eq('id', 'global_config')
      .single();

    if (!settings || !settings.resend_api_key) {
      console.log('No Resend API Key found. Email skipped.');
      return NextResponse.json({ success: true, note: 'No API key provided' });
    }

    const resend = new Resend(settings.resend_api_key);
    const fromEmail = settings.resend_from_email || 'Lec Delights <onboarding@resend.dev>';

    // --- NEW: GENERATE ITEMIZED LIST HTML ---
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
          <div style="font-weight: bold; color: #111827; font-size: 14px;">${item.name}</div>
          <div style="font-size: 12px; color: #6b7280;">Quantity: ${item.quantity}</div>
        </td>
        <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #111827;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [order.email],
      subject: `Order Confirmed! #${order.id ? order.id.slice(0,8).toUpperCase() : 'NEW'} 🌿`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #374151; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-family: serif; color: #7fae45; font-size: 28px; margin-bottom: 10px;">Delicious Choice!</h1>
            <p style="font-size: 16px; color: #6b7280;">Thank you for your order, ${order.customer_name}. We're getting your treats ready!</p>
          </div>
          
          <div style="background-color: #fafaf9; padding: 30px; border-radius: 24px; border: 1px solid #f1f1ef;">
            <h3 style="margin-top: 0; font-family: serif; font-size: 18px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 15px;">Order Summary</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${itemsHtml}
            </table>

            <div style="border-top: 2px dashed #e5e7eb; pt-15px; margin-top: 15px;">
              <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <span style="color: #6b7280;">Subtotal</span>
                <span style="font-weight: bold; color: #111827; float: right;">₹${order.subtotal}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                <span style="color: #6b7280;">Shipping</span>
                <span style="font-weight: bold; color: #7fae45; float: right;">${order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
              </div>
              <div style="margin-top: 20px; text-align: right;">
                <span style="font-size: 24px; font-weight: bold; color: #111827;">Total: ₹${order.total}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 30px; background-color: #fff; border: 1px solid #f3f4f6; padding: 20px; border-radius: 16px;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af;">Shipping To</h4>
            <p style="margin: 0; line-height: 1.6; color: #4b5563; font-size: 15px;">
              <strong>${order.customer_name}</strong><br/>
              ${order.address}<br/>
              ${order.city}, ${order.state} - ${order.pincode}
            </p>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://lecdelights.com'}/orders" 
               style="background-color: #111827; color: #ffffff; padding: 18px 32px; text-decoration: none; border-radius: 14px; font-weight: bold; display: inline-block; font-size: 14px;">
               Track My Order
            </a>
          </div>

          <p style="margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5;">
            Lec Delights — Authentic Homemade Delicacies from Jowai, Meghalaya.<br/>
            If you have any questions, just reply to this email.
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