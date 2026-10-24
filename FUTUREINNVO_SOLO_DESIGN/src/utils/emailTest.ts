import emailjs from '@emailjs/browser';

// Test EmailJS configuration
export const testEmailJSConfig = () => {
  console.log('EmailJS Configuration Test:');
  console.log('Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
  console.log('Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
  console.log('Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  
  // Check if all required environment variables are present
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  
  if (!serviceId || !templateId || !publicKey) {
    console.error('Missing EmailJS environment variables!');
    return false;
  }
  
  console.log('All EmailJS environment variables are present ✓');
  return true;
};

// Send a test email
export const sendTestEmail = async () => {
  try {
    // Initialize EmailJS
    emailjs.init({
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    });

    const templateParams = {
      from_name: 'Test User',
      from_email: 'test@example.com',
      company: 'Test Company',
      subject: 'Test Email from Contact Form',
      message: 'This is a test message to verify EmailJS integration is working correctly.',
      to_name: 'FUTUREINNVO Team',
      to_email: 'info@futureinnvo.com',
      reply_to: 'test@example.com',
      timestamp: new Date().toLocaleString(),
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Test email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Test email failed:', error);
    return { success: false, error };
  }
};
