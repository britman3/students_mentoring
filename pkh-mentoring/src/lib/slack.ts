interface SlackNotificationData {
  studentName: string;
  email: string;
  closerName: string | null;
  slotDisplayName: string;
  weekNumber: number;
  groupCode: string;
  firstCallDate: string;
  lastCallDate: string;
  joinLink: string;
}

export async function sendSlackNotification(
  data: SlackNotificationData
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not configured, skipping notification");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "\ud83c\udf93 New Student Enrolled",
              emoji: true,
            },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Name:*\n${data.studentName}` },
              { type: "mrkdwn", text: `*Email:*\n${data.email}` },
              {
                type: "mrkdwn",
                text: `*Closer:*\n${data.closerName || "Direct"}`,
              },
              {
                type: "mrkdwn",
                text: `*Slot:*\n${data.slotDisplayName}`,
              },
              {
                type: "mrkdwn",
                text: `*Assigned:*\nWeek ${data.weekNumber} \u2014 ${data.groupCode}`,
              },
              {
                type: "mrkdwn",
                text: `*First Call:*\n${data.firstCallDate}`,
              },
              {
                type: "mrkdwn",
                text: `*Last Call:*\n${data.lastCallDate}`,
              },
              {
                type: "mrkdwn",
                text: `*Join Link:*\n${data.joinLink}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(
        "Slack webhook returned non-OK status:",
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}
