/**
 * Notification Service for Tha Luang Technical College Admission System
 * Supports LINE Messaging API (replacing legacy LINE Notify) and Simulated Dispatch
 */

interface SendLineNotificationParams {
  title: string;
  applicantName: string;
  applicationNo: string;
  level: string;
  major: string;
  status: string;
  details?: string;
}

export async function sendLineBroadcastNotification(params: SendLineNotificationParams) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const adminId = process.env.LINE_ADMIN_USER_ID;

  const messageText = `📢 [ระบบรับสมัครโควตา 2570]\n${params.title}\n-------------------------\n👤 ผู้สมัคร: ${params.applicantName}\n📄 เลขที่: ${params.applicationNo}\n🎓 ระดับ: ${params.level}\n🏛️ สาขาวิชา: ${params.major}\n📌 สถานะ: ${params.status}${params.details ? `\n💬 รายละเอียด: ${params.details}` : ''}\n-------------------------\nวิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์`;

  if (!token || !adminId) {
    console.log('[NOTIFICATION SIMULATED]:', messageText);
    return {
      success: true,
      simulated: true,
      message: 'LINE tokens not set in .env - Simulated notification logged to console',
    };
  }

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: adminId,
        messages: [
          {
            type: 'text',
            text: messageText,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to send LINE message:', errText);
      return { success: false, error: errText };
    }

    return { success: true, simulated: false };
  } catch (error: any) {
    console.error('Error sending LINE notification:', error);
    return { success: false, error: error.message };
  }
}
