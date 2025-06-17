const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

// Create transporter with your SMTP config
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // Only if you have certificate issues
    }
  });
};

// Email template for congratulations
const getCongratulatoryEmailTemplate = (employeeName, quarter, category, hrMessage) => {
  return {
    subject: `🎉 Congratulations! You've achieved ${category} for Quarter ${quarter}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 20px; max-width: 700px; margin: 0 auto; border-radius: 8px; border: 1px solid #e0e0e0;">

        <!-- Header -->
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
          <p style="margin: 5px 0 0 0; font-size: 18px;">You’ve achieved excellence!</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333;">Dear ${employeeName},</h2>

          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We are absolutely delighted to announce that you have been recognized as a <strong style="color: #4CAF50;">${category}</strong> achiever for <strong>Quarter ${quarter}</strong>!
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Your commitment, passion, and outstanding performance have made a significant impact. This achievement highlights your exceptional contribution to our team’s success.
          </p>

          <!-- Achievement Card -->
          <div style="background-color: #f1f9f0; padding: 20px; border-left: 5px solid #4CAF50; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 0; font-size: 18px; color: #333;"><strong>🏆 Achievement:</strong> <span style="color: #4CAF50;">${category}</span></p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #333;"><strong>📅 Quarter:</strong> ${quarter}</p>
          </div>

          <!-- HR Message -->
          ${hrMessage ? `
            <div style="background-color: #eaf4fc; padding: 20px; border-left: 5px solid #007bff; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 16px; color: #007bff;"><strong>💬 HR Message:</strong> ${hrMessage}</p>
            </div>
          ` : ''}

          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            This recognition places you among our top performers for this quarter. We are proud to have you on the team and look forward to your continued success.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Warm regards,<br>
            <strong>${process.env.FROM_NAME}</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 15px; font-size: 12px; color: #888; background-color: #f4f6f8;">
          <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} ${process.env.FROM_NAME}. All rights reserved.</p>
        </div>
      </div>
    `
  };
};


// Function to send individual email
const sendEmail = async (toEmail, employeeName, quarter, category, hrMessage) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = getCongratulatoryEmailTemplate(employeeName, quarter, category, hrMessage);

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${toEmail}:`, result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error(`Failed to send email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Function to send mass emails
const sendMassEmails = async (employees, quarter, hrMessage) => {
  const results = [];

  console.log(`Starting to send emails to ${employees.length} employees for Quarter ${quarter}`);

  for (const employee of employees) {
    if (employee.mail && employee.name) {
      const result = await sendEmail(employee.mail, employee.name, quarter, employee.category, hrMessage);
      results.push({
        empid: employee.empid,
        email: employee.mail,
        name: employee.name,
        ...result
      });

      // Add small delay to avoid overwhelming SMTP server
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      console.warn(`Skipping employee ${employee.empid}: Missing email or name`);
      results.push({
        empid: employee.empid,
        email: employee.mail || 'N/A',
        name: employee.name || 'N/A',
        success: false,
        error: 'Missing email or name'
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`Email sending completed: ${successCount} successful, ${failCount} failed`);

  return {
    totalEmails: employees.length,
    successCount,
    failCount,
    results
  };
};

module.exports = {
  sendEmail,
  sendMassEmails
};
