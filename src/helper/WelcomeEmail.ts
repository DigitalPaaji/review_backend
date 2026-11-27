import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()



const transporter = nodemailer.createTransport({
 service:"gmail",
  auth: {
    user: process.env.EMAIL_USER1,
    pass: process.env.EMAIL_PASS1,
  },
});




export const sendEmail = async (to: string) => {
  return transporter.sendMail({
    from: `"" <${process.env.EMAIL_USER1}>`,
    to,
    subject: "Welcome! Thank You for Your Submission 🎉",

html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:#f1f5f9;padding:35px 15px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background:linear-gradient(135deg,#312e81,#4f46e5,#7c3aed);padding:40px 25px;">

              <div style="font-size:42px;margin-bottom:12px;">
                🎉
              </div>

              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">
                Welcome Aboard!
              </h1>

              <p style="margin:12px 0 0;color:#e0e7ff;font-size:15px;">
                Thank you for getting in touch with us.
              </p>

            </td>
          </tr>

          <!-- Hero Image -->
          <tr>
            <td>
              <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop&q=80"
                alt="Modern professional workspace"
                width="600"
                style="display:block;width:100%;max-width:600px;height:190px;object-fit:cover;border:0;"
              />
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:35px 30px;color:#334155;">

              <h2 style="margin:0 0 18px;color:#0f172a;font-size:23px;">
                Hello there! 👋
              </h2>

              <p style="font-size:15px;line-height:1.8;color:#475569;margin:0 0 18px;">
                Thank you for taking the time to submit your information
                through our website. We're delighted to hear from you!
              </p>

              <p style="font-size:15px;line-height:1.8;color:#475569;margin:0 0 25px;">
                Your submission has been successfully received, and our team
                will review the details and get back to you shortly.
              </p>

              <!-- Confirmation Card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#eef2ff;border-radius:12px;border:1px solid #c7d2fe;">
                <tr>
                  <td style="padding:22px;">

                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:25px;padding-right:12px;">
                          ✅
                        </td>
                        <td>
                          <h3 style="margin:0;color:#312e81;font-size:16px;">
                            Submission Received!
                          </h3>
                          <p style="margin:6px 0 0;color:#6366a8;font-size:13px;line-height:1.6;">
                            Everything looks good. Your information is now
                            with our team for review.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <p style="font-size:15px;line-height:1.8;color:#475569;margin:25px 0;">
                We truly appreciate your interest and look forward to
                connecting with you soon.
              </p>

              <p style="font-size:15px;line-height:1.8;color:#334155;margin:25px 0 0;">
                Warm regards,<br/>
                <strong style="color:#4f46e5;">Our Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="background:#f8fafc;padding:25px 20px;border-top:1px solid #e2e8f0;">

              <p style="margin:0 0 8px;color:#334155;font-size:14px;font-weight:bold;">
                Thank you for choosing us!
              </p>

              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
                <a href="https://digitalpaaji.com  >Digital Paaji</a> .<br/>
                © ${new Date().getFullYear()} All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`,

  });
};

const escapeHtml = (value: unknown): string => {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
};

export const sendToClient = async(to:string,submissionData:string)=>{
  try{
    const fieldsHtml = Object.entries(JSON.parse(submissionData)).map(
        ([key, value]) => `
          <tr>
            <td style="
              padding:14px;
              border-bottom:1px solid #e2e8f0;
              color:#64748b;
              font-size:14px;
              font-weight:600;
              width:40%;
              vertical-align:top;
            ">
              ${escapeHtml(key)}
            </td>

            <td style="
              padding:14px;
              border-bottom:1px solid #e2e8f0;
              color:#1e293b;
              font-size:14px;
              line-height:1.6;
              vertical-align:top;
              word-break:break-word;
            ">
              ${escapeHtml(
                typeof value === "object"
                  ? JSON.stringify(value)
                  : value
              )}
            </td>
          </tr>
        `
      )
      .join("");

    const currentYear = new Date().getFullYear();


   const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>

    <body style="margin:0;padding:25px 10px;background:#f1f5f9;font-family:Arial,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0"
              style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;">

              <tr>
                <td align="center" style="background:#4338ca;padding:35px 25px;color:white;">
                  <div style="font-size:40px;">📩</div>
                  <h1 style="margin:12px 0;font-size:26px;">
                    New Lead Received!
                  </h1>
                  <p style="margin:0;color:#e0e7ff;font-size:14px;">
                    A new user has submitted your website form.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:30px;color:#334155;">

                  <h2 style="color:#0f172a;font-size:21px;">
                    New Form Submission 🚀
                  </h2>

                  <p style="font-size:15px;line-height:1.7;color:#64748b;">
                    You have received a new lead through your website.
                    Below are the details submitted by the user.
                  </p>

                  <h3 style="color:#0f172a;font-size:17px;margin-top:25px;">
                    Lead Information
                  </h3>

                  <table width="100%" cellpadding="0" cellspacing="0"
                    style="border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;">

                    ${fieldsHtml || `
                      <tr>
                        <td style="padding:15px;color:#64748b;">
                          No information provided.
                        </td>
                      </tr>
                    `}

                  </table>

                  <div style="margin-top:25px;padding:18px;background:#eef2ff;border-radius:10px;">
                    <h3 style="margin:0;color:#3730a3;font-size:16px;">
                      ✅ Lead Successfully Captured
                    </h3>
                    <p style="margin:8px 0 0;color:#475569;font-size:14px;line-height:1.6;">
                      Please review this enquiry and contact the user.
                    </p>
                  </div>

                  <p style="margin-top:30px;color:#475569;font-size:14px;">
                    Best Regards,<br/>
                    <strong style="color:#4338ca;">Website Lead System</strong>
                    <a href="https://digitalpaaji.com style="color:#4338ca;">Digital Paaji</a>
                  </p>

                </td>
              </tr>

              <tr>
                <td align="center" style="background:#f8fafc;padding:22px;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;color:#94a3b8;font-size:12px;">
                    <a href="https://digitalpaaji.com  >Digital Paaji</a> · © ${currentYear}
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Website Lead Notification" <${process.env.SMTP_USER}>`,
      to,
      subject: "📩 New Website Lead Received",
      html,
    });

    console.log("Email sent successfully:", info.messageId);

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };

  } catch (error) {
    console.error("Email sending failed:", error);

    return {
      success: false,
      message: "Failed to send email",
    };
  }

}



