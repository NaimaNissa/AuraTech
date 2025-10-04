// Contact form email service
// This service provides multiple methods to send contact form emails

// Method 1: Using EmailJS (if properly configured)
export const sendContactEmailViaEmailJS = async (contactData) => {
  try {
    const emailjs = await import('@emailjs/browser');
    
    const response = await emailjs.default.send(
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
  } catch (error) {
    console.error('❌ EmailJS failed:', error);
    throw error;
  }
};

// Method 2: Using mailto link (fallback)
export const sendContactEmailViaMailto = async (contactData) => {
  try {
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
  } catch (error) {
    console.error('❌ Mailto failed:', error);
    throw error;
  }
};

// Method 3: Store in Firebase for admin to see (backup method)
export const storeContactMessageInFirebase = async (contactData) => {
  try {
    const { collection, addDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    
    const contactMessagesRef = collection(db, 'contactMessages');
    
    const messageData = {
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject || 'Contact from AuraTech Website',
      message: contactData.message,
      status: 'unread',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(contactMessagesRef, messageData);
    console.log('✅ Contact message stored in Firebase:', docRef.id);
    
    return { 
      success: true, 
      method: 'firebase',
      messageId: docRef.id,
      recipient: 'auratechs30@gmail.com',
      sender: contactData.email,
      subject: contactData.subject || 'Contact from AuraTech Website'
    };
  } catch (error) {
    console.error('❌ Firebase storage failed:', error);
    throw error;
  }
};

// Main function that tries all methods (prevents duplication)
export const sendContactEmail = async (contactData) => {
  console.log('📧 Sending contact email:', contactData);
  
  // Always store in Firebase first for admin to see
  let firebaseResult = null;
  try {
    firebaseResult = await storeContactMessageInFirebase(contactData);
    console.log('✅ Message stored in Firebase for admin review');
  } catch (firebaseError) {
    console.log('⚠️ Firebase storage failed:', firebaseError);
  }
  
  // Try EmailJS for direct email sending
  try {
    const emailjsResult = await sendContactEmailViaEmailJS(contactData);
    console.log('✅ Email sent via EmailJS');
    return {
      ...emailjsResult,
      firebaseMessageId: firebaseResult?.messageId
    };
  } catch (emailjsError) {
    console.log('⚠️ EmailJS failed, trying mailto method:', emailjsError);
  }
  
  // Try mailto as fallback
  try {
    const mailtoResult = await sendContactEmailViaMailto(contactData);
    console.log('✅ Email prepared via mailto');
    return {
      ...mailtoResult,
      firebaseMessageId: firebaseResult?.messageId
    };
  } catch (mailtoError) {
    console.log('⚠️ Mailto failed:', mailtoError);
  }
  
  // If all email methods fail, at least we have it stored in Firebase
  if (firebaseResult) {
    console.log('✅ Message stored in Firebase (email methods failed)');
    return {
      success: true,
      method: 'firebase_only',
      messageId: firebaseResult.messageId,
      recipient: 'auratechs30@gmail.com',
      sender: contactData.email,
      subject: contactData.subject || 'Contact from AuraTech Website',
      note: 'Message stored in admin dashboard. Email sending failed.'
    };
  }
  
  // If everything fails
  console.error('❌ All methods failed');
  throw new Error('Failed to send contact message. Please try again or contact us directly at auratechs30@gmail.com');
};
