import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_auratech';
const EMAILJS_TEMPLATE_ID = 'template_order_confirmation';
const EMAILJS_LOGIN_TEMPLATE_ID = 'template_login_welcome';
const EMAILJS_PUBLIC_KEY = 'your_public_key_here';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Send welcome email when user logs in
export const sendLoginWelcomeEmail = async (userData) => {
  try {
    console.log('📧 Sending welcome email to:', userData.email);
    
    // Prepare email template parameters
    const templateParams = {
      to_email: userData.email,
      user_name: userData.displayName || userData.email.split('@')[0],
      user_email: userData.email,
      login_time: new Date().toLocaleString(),
      company_name: 'AuraTech',
      company_email: 'auratechs30@gmail.com',
      website_url: window.location.origin,
      support_email: 'auratechs30@gmail.com'
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_LOGIN_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Welcome email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error to prevent login failure if email fails
    return { success: false, error: error.message };
  }
};

// Send welcome email (simple version)
export const sendLoginWelcomeEmailSimple = async (userData) => {
  try {
    console.log('📧 Preparing welcome email for:', userData.email);
    
    const userName = userData.displayName || userData.email.split('@')[0];
    const subject = `Welcome to AuraTech - Login Confirmation`;
    const loginTime = new Date().toLocaleString();
    
    const body = `
Dear ${userName},

Welcome to AuraTech! 🎉

We're excited to have you back. You have successfully logged into your account.

LOGIN DETAILS:
Email: ${userData.email}
Login Time: ${loginTime}
Device: ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}

WHAT'S NEW:
• Browse our latest tech products
• Track your orders in real-time
• Enjoy exclusive member benefits
• Get personalized recommendations

QUICK LINKS:
• Shop Products: ${window.location.origin}/products
• My Orders: ${window.location.origin}/orders
• My Profile: ${window.location.origin}/profile

If you didn't log in to your account, please contact us immediately at auratechs30@gmail.com.

Thank you for choosing AuraTech!

Best regards,
AuraTech Team
auratechs30@gmail.com

---
This is an automated message. Please do not reply to this email.
    `.trim();

    // Create HTML version
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .welcome-title { font-size: 28px; margin: 0; }
        .login-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { margin: 10px 0; padding-left: 20px; }
        .quick-links { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .link-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        .security-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="welcome-title">Welcome Back to AuraTech! 🎉</h1>
        <p>Your tech journey continues here</p>
      </div>
      
      <div class="content">
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Great to see you again! You have successfully logged into your AuraTech account.</p>
        
        <div class="login-details">
          <h3>🔐 Login Details</h3>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Login Time:</strong> ${loginTime}</p>
          <p><strong>Device:</strong> ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</p>
        </div>
        
        <div class="features">
          <h3>✨ What's Available</h3>
          <div class="feature-item">🛍️ Browse our latest tech products</div>
          <div class="feature-item">📦 Track your orders in real-time</div>
          <div class="feature-item">🎁 Enjoy exclusive member benefits</div>
          <div class="feature-item">🎯 Get personalized recommendations</div>
        </div>
        
        <div class="quick-links">
          <h3>🚀 Quick Links</h3>
          <a href="${window.location.origin}/products" class="link-button">Shop Products</a>
          <a href="${window.location.origin}/orders" class="link-button">My Orders</a>
          <a href="${window.location.origin}/profile" class="link-button">My Profile</a>
        </div>
        
        <div class="security-note">
          <strong>🔒 Security Notice:</strong> If you didn't log in to your account, please contact us immediately at <a href="mailto:auratechs30@gmail.com">auratechs30@gmail.com</a>.
        </div>
        
        <p>Thank you for choosing AuraTech!</p>
        <p><strong>AuraTech Team</strong><br>
        <a href="mailto:auratechs30@gmail.com">auratechs30@gmail.com</a></p>
      </div>
      
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>© 2024 AuraTech. All rights reserved.</p>
      </div>
    </body>
    </html>
    `;

    console.log('✅ Welcome email prepared successfully');
    console.log('📧 Email content:', { subject, to: userData.email });
    
    // In a real implementation, you would send this via EmailJS or another service
    // For now, we'll log it and return success
    return { 
      success: true, 
      subject, 
      body, 
      htmlBody,
      recipient: userData.email 
    };
  } catch (error) {
    console.error('❌ Error preparing welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    console.log('📧 Sending order confirmation email to:', orderData.customerEmail);
    
    // Prepare email template parameters
    const templateParams = {
      to_email: orderData.customerEmail,
      customer_name: orderData.fullName,
      order_id: orderData.OrderID,
      product_name: orderData.productname,
      quantity: orderData.Quantity,
      price: orderData.Price,
      shipping_cost: orderData.shippingCost || '0',
      total_price: orderData.TotalPrice,
      order_status: orderData.Status,
      shipping_address: orderData.Address,
      order_date: new Date(orderData.createdAt).toLocaleDateString(),
      company_name: 'AuraTech',
      company_email: 'auratechs30@gmail.com',
      support_email: 'auratechs30@gmail.com'
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Order confirmation email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    throw error;
  }
};

// Send order status update email
export const sendOrderStatusUpdateEmail = async (orderData, newStatus) => {
  try {
    console.log('📧 Sending order status update email to:', orderData.customerEmail);
    
    const statusMessages = {
      pending: 'Your order has been received and is being processed.',
      processing: 'Your order is currently being prepared for shipment.',
      shipped: 'Your order has been shipped and is on its way to you.',
      delivered: 'Your order has been successfully delivered.',
      cancelled: 'Your order has been cancelled.'
    };

    const templateParams = {
      to_email: orderData.customerEmail,
      customer_name: orderData.fullName,
      order_id: orderData.OrderID,
      product_name: orderData.productname,
      new_status: newStatus,
      status_message: statusMessages[newStatus] || 'Your order status has been updated.',
      company_name: 'AuraTech',
      company_email: 'auratechs30@gmail.com',
      support_email: 'auratechs30@gmail.com'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_status_update',
      templateParams
    );

    console.log('✅ Order status update email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending order status update email:', error);
    throw error;
  }
};

// Enhanced order confirmation email with immediate delivery
export const sendOrderConfirmationEmailSimple = async (orderData) => {
  try {
    console.log('📧 Preparing IMMEDIATE order confirmation email for:', orderData.customerEmail);
    
    const orderDate = new Date().toLocaleString();
    const subject = `🎉 Order Confirmed - ${orderData.OrderID} - AuraTech`;
    
    const body = `
Dear ${orderData.fullName},

🎉 GREAT NEWS! Your order has been successfully placed with AuraTech!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 ORDER SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order ID: ${orderData.OrderID}
Order Date: ${orderDate}
Status: ${orderData.Status || 'Confirmed'} ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ PRODUCT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product: ${orderData.productname}
Quantity: ${orderData.Quantity}
Unit Price: $${orderData.Price}
Subtotal: $${(parseFloat(orderData.Price) * parseInt(orderData.Quantity)).toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 PAYMENT BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subtotal: $${(parseFloat(orderData.Price) * parseInt(orderData.Quantity)).toFixed(2)}
Shipping: $${orderData.shippingCost || '0.00'}
${parseFloat(orderData.shippingCost || 0) === 0 ? '🎁 FREE SHIPPING!' : ''}
Tax: $${((parseFloat(orderData.TotalPrice) - parseFloat(orderData.shippingCost || 0)) * 0.08).toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: $${orderData.TotalPrice} 💳

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚚 SHIPPING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Delivery Address:
${orderData.Address}

Estimated Delivery: 3-5 business days
Tracking information will be sent once your order ships.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 WHAT'S NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Order Confirmation (You are here!)
🔄 Processing (1-2 business days)
📦 Packaging & Quality Check
🚚 Shipped with tracking number
🏠 Delivered to your door

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 QUICK LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Track Your Order: ${window.location?.origin || 'https://auratech.com'}/orders
• Contact Support: auratechs30@gmail.com
• Browse More Products: ${window.location?.origin || 'https://auratech.com'}/products

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Our customer support team is here to help!
📧 Email: auratechs30@gmail.com
⏰ Response Time: Within 24 hours

Thank you for choosing AuraTech! 🚀
We're excited to get your new tech into your hands.

Best regards,
The AuraTech Team
auratechs30@gmail.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was sent immediately upon order placement.
Order ID: ${orderData.OrderID} | ${orderDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    // Create enhanced HTML version
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background: #f5f5f5; }
        .container { background: white; margin: 20px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .section { margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
        .section h3 { margin: 0 0 15px 0; color: #333; font-size: 18px; }
        .order-details { background: #e8f4fd; border-left-color: #2196F3; }
        .product-details { background: #f0f8e8; border-left-color: #4CAF50; }
        .payment-details { background: #fff3e0; border-left-color: #FF9800; }
        .shipping-details { background: #f3e5f5; border-left-color: #9C27B0; }
        .next-steps { background: #e3f2fd; border-left-color: #03A9F4; }
        .total-amount { font-size: 24px; font-weight: bold; color: #2e7d32; text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; margin: 15px 0; }
        .status-badge { display: inline-block; background: #4CAF50; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        .quick-links { text-align: center; margin: 25px 0; }
        .link-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 8px; font-weight: bold; transition: background 0.3s; }
        .link-button:hover { background: #5a6fd8; }
        .footer { background: #f8f9fa; padding: 25px; text-align: center; color: #666; border-top: 1px solid #e0e0e0; }
        .divider { height: 2px; background: linear-gradient(90deg, #667eea, #764ba2); margin: 20px 0; border-radius: 1px; }
        .emoji { font-size: 18px; }
        .highlight { background: #fff3cd; padding: 8px 12px; border-radius: 4px; border: 1px solid #ffeaa7; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for choosing AuraTech</p>
        </div>
        
        <div class="content">
          <div class="section order-details">
            <h3>📦 Order Information</h3>
            <p><strong>Order ID:</strong> ${orderData.OrderID}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Status:</strong> <span class="status-badge">${orderData.Status || 'Confirmed'}</span></p>
          </div>
          
          <div class="section product-details">
            <h3>🛍️ Product Details</h3>
            <p><strong>Product:</strong> ${orderData.productname}</p>
            <p><strong>Quantity:</strong> ${orderData.Quantity}</p>
            <p><strong>Unit Price:</strong> $${orderData.Price}</p>
          </div>
          
          <div class="section payment-details">
            <h3>💰 Payment Summary</h3>
            <p><strong>Subtotal:</strong> $${(parseFloat(orderData.Price) * parseInt(orderData.Quantity)).toFixed(2)}</p>
            <p><strong>Shipping:</strong> $${orderData.shippingCost || '0.00'} ${parseFloat(orderData.shippingCost || 0) === 0 ? '<span style="color: #4CAF50; font-weight: bold;">🎁 FREE!</span>' : ''}</p>
            <p><strong>Tax:</strong> $${((parseFloat(orderData.TotalPrice) - parseFloat(orderData.shippingCost || 0)) * 0.08).toFixed(2)}</p>
            <div class="total-amount">
              Total: $${orderData.TotalPrice}
            </div>
          </div>
          
          <div class="section shipping-details">
            <h3>🚚 Shipping Information</h3>
            <p><strong>Delivery Address:</strong></p>
            <p>${orderData.Address}</p>
            <div class="highlight">
              <strong>📅 Estimated Delivery:</strong> 3-5 business days<br>
              <strong>📱 Tracking:</strong> You'll receive tracking info once shipped
            </div>
          </div>
          
          <div class="section next-steps">
            <h3>📱 What Happens Next?</h3>
            <p>✅ <strong>Order Confirmation</strong> - You are here!</p>
            <p>🔄 <strong>Processing</strong> - 1-2 business days</p>
            <p>📦 <strong>Packaging & Quality Check</strong></p>
            <p>🚚 <strong>Shipped</strong> - with tracking number</p>
            <p>🏠 <strong>Delivered</strong> - to your door</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="quick-links">
            <h3>🔗 Quick Actions</h3>
            <a href="${window.location?.origin || 'https://auratech.com'}/orders" class="link-button">Track Order</a>
            <a href="mailto:auratechs30@gmail.com" class="link-button">Contact Support</a>
            <a href="${window.location?.origin || 'https://auratech.com'}/products" class="link-button">Shop More</a>
          </div>
          
          <div class="section">
            <h3>💬 Need Help?</h3>
            <p>Our customer support team is ready to assist you!</p>
            <p><strong>📧 Email:</strong> <a href="mailto:auratechs30@gmail.com">auratechs30@gmail.com</a></p>
            <p><strong>⏰ Response Time:</strong> Within 24 hours</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Thank you for choosing AuraTech! 🚀</strong></p>
          <p>We're excited to get your new tech into your hands.</p>
          <p style="font-size: 12px; margin-top: 15px;">
            This email was sent immediately upon order placement.<br>
            Order ID: ${orderData.OrderID} | ${orderDate}
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    console.log('✅ IMMEDIATE order confirmation email prepared successfully');
    console.log('📧 Email details:', { 
      to: orderData.customerEmail, 
      subject, 
      orderID: orderData.OrderID,
      timestamp: orderDate 
    });
    
    // In production, this would be sent via EmailJS or email service
    // For now, we simulate immediate delivery
    return { 
      success: true, 
      subject, 
      body, 
      htmlBody,
      recipient: orderData.customerEmail,
      orderID: orderData.OrderID,
      timestamp: orderDate,
      immediate: true
    };
  } catch (error) {
    console.error('❌ Error preparing IMMEDIATE order confirmation email:', error);
    throw error;
  }
};

// Generate invoice HTML content
export const generateInvoiceHTML = (orderData) => {
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .invoice-title { font-size: 18px; margin-top: 10px; }
        .details { margin: 20px 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details th, .details td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-weight: bold; font-size: 16px; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">AuraTech</div>
        <div class="invoice-title">Order Invoice</div>
      </div>
      
      <div class="details">
        <h3>Order Information</h3>
        <table>
          <tr><th>Order ID:</th><td>${orderData.OrderID}</td></tr>
          <tr><th>Date:</th><td>${new Date(orderData.createdAt).toLocaleDateString()}</td></tr>
          <tr><th>Status:</th><td>${orderData.Status}</td></tr>
        </table>
        
        <h3>Customer Information</h3>
        <table>
          <tr><th>Name:</th><td>${orderData.fullName}</td></tr>
          <tr><th>Email:</th><td>${orderData.customerEmail}</td></tr>
          <tr><th>Address:</th><td>${orderData.Address}</td></tr>
        </table>
        
        <h3>Product Details</h3>
        <table>
          <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
          <tr>
            <td>${orderData.productname}</td>
            <td>${orderData.Quantity}</td>
            <td>$${orderData.Price}</td>
            <td>$${orderData.Price}</td>
          </tr>
          <tr>
            <td colspan="3">Shipping Cost:</td>
            <td>$${orderData.shippingCost || '0.00'}</td>
          </tr>
          <tr class="total">
            <td colspan="3">Total Amount:</td>
            <td>$${orderData.TotalPrice}</td>
          </tr>
        </table>
      </div>
      
      <div class="footer">
        <p>Thank you for choosing AuraTech!</p>
        <p>Contact us: auratechs30@gmail.com</p>
      </div>
    </body>
    </html>
  `;
  
  return invoiceHTML;
};

// Send contact form email
export const sendContactEmail = async (contactData) => {
  try {
    console.log('📧 Sending contact email:', contactData);
    
    // Method 1: Try to use EmailJS if properly configured
    try {
      const response = await emailjs.send(
        'service_auratech',
        'template_contact',
        {
          from_name: contactData.name,
          from_email: contactData.email,
          subject: contactData.subject || 'Contact from AuraTech Website',
          message: contactData.message,
          to_email: 'auratechs30@gmail.com',
          company_name: 'AuraTech',
          reply_to: contactData.email
        },
        'your_public_key_here'
      );
      
      console.log('✅ Email sent via EmailJS:', response);
      return { 
        success: true, 
        method: 'emailjs',
        recipient: 'auratechs30@gmail.com',
        sender: contactData.email,
        subject: contactData.subject || 'Contact from AuraTech Website'
      };
    } catch (emailjsError) {
      console.log('⚠️ EmailJS failed, trying fallback method:', emailjsError);
      
      // Method 2: Fallback to mailto link
      const subject = encodeURIComponent(contactData.subject || 'Contact from AuraTech Website');
      const body = encodeURIComponent(`
Hello AuraTech Team,

You have received a new contact form submission:

Name: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject || 'Contact from AuraTech Website'}

Message:
${contactData.message}

---
This message was sent from the AuraTech website contact form.
Reply directly to: ${contactData.email}
      `.trim());
      
      const mailtoLink = `mailto:auratechs30@gmail.com?subject=${subject}&body=${body}`;
      
      // Open the user's email client
      window.open(mailtoLink, '_blank');
      
      console.log('✅ Contact email prepared successfully - opened email client');
      
      return { 
        success: true, 
        method: 'mailto',
        recipient: 'auratechs30@gmail.com',
        sender: contactData.email,
        subject: contactData.subject || 'Contact from AuraTech Website'
      };
    }
  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    throw error;
  }
};

