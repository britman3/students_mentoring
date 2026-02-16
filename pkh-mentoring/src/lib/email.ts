import { Resend } from "resend";

interface ConfirmationEmailData {
  student: {
    firstName: string;
    email: string;
    joinCode: string;
  };
  slotInstance: {
    weekNumber: number;
    groupCode: string;
  };
  slot: {
    displayName: string;
  };
  settings: {
    showGroupCodes: boolean;
  };
  appUrl: string;
  firstCallDate: string;
  lastCallDate: string;
}

export async function sendConfirmationEmail(
  data: ConfirmationEmailData
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = buildConfirmationHtml(data);

  await resend.emails.send({
    from: "Property Know How Support <support@propertyknowhow.com>",
    replyTo: "support@propertyknowhow.com",
    to: data.student.email,
    subject: "Your Mentoring Call Details \u2014 Property Know How",
    html,
  });
}

function buildConfirmationHtml(data: ConfirmationEmailData): string {
  const joinLink = `${data.appUrl}/join/${data.student.joinCode}`;

  const groupCodeLine = `
                      <tr>
                        <td style="padding: 0 0 8px 0;">
                          <p style="margin: 0; font-size: 14px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">
                            Your Group
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0;">
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1B2A4A;">
                            ${data.slotInstance.groupCode}
                          </p>
                        </td>
                      </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Mentoring Call Details</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: 'Inter', Arial, Helvetica, sans-serif; color: #2D2D2D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Navy Header -->
          <tr>
            <td style="background-color: #1B2A4A; padding: 28px 32px; text-align: center;">
              <img src="${data.appUrl}/pkh_logo.svg" alt="Property Know How" style="max-width: 180px; height: auto;" />
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #2D2D2D;">
                      Hi ${data.student.firstName},
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #2D2D2D;">
                      Your mentoring call is booked!
                    </p>
                  </td>
                </tr>

                <!-- Details Card -->
                <tr>
                  <td style="padding: 0 0 24px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F0E8; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 0 0 8px 0;">
                                <p style="margin: 0; font-size: 14px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  Your Call Time
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0 0 16px 0;">
                                <p style="margin: 0; font-size: 20px; font-weight: 700; color: #1B2A4A;">
                                  ${data.slot.displayName}, fortnightly
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0 0 8px 0;">
                                <p style="margin: 0; font-size: 14px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  First Call
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0 0 16px 0;">
                                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1B2A4A;">
                                  ${data.firstCallDate}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0 0 8px 0;">
                                <p style="margin: 0; font-size: 14px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  Last Call
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0 0 16px 0;">
                                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1B2A4A;">
                                  ${data.lastCallDate}
                                </p>
                              </td>
                            </tr>
                            ${groupCodeLine}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Join Button -->
                <tr>
                  <td style="padding: 0 0 8px 0;">
                    <a href="${joinLink}" style="display: inline-block; background-color: #1B2A4A; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Join Your Mentoring Call
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 24px 0;">
                    <p style="margin: 0; font-size: 13px; color: #6B7280;">
                      Use this link every fortnight to join your call
                    </p>
                  </td>
                </tr>

                <!-- Gold Divider -->
                <tr>
                  <td style="padding: 0 0 24px 0;">
                    <hr style="border: none; height: 2px; background-color: #C9A84C; margin: 0;" />
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6B7280;">
                      If you need to change your slot, please contact your enrolment coach or email us at
                      <a href="mailto:support@propertyknowhow.com" style="color: #1B2A4A; text-decoration: underline;">support@propertyknowhow.com</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F5F0E8; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.5;">
                Property Know How Support &mdash;
                <a href="mailto:support@propertyknowhow.com" style="color: #6B7280; text-decoration: underline;">support@propertyknowhow.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
