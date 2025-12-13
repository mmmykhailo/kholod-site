import { Resend } from "resend";
import type { Route } from "./+types/api.contact";

const resend = new Resend(process.env.RESEND_API_KEY);

function validateUkrainianPhone(phone: string): boolean {
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  // Valid formats:
  // +380XXXXXXXXX (13 chars with +)
  // 380XXXXXXXXX (12 chars)
  // 0XXXXXXXXX (10 chars)

  if (cleanPhone.startsWith("+380") && cleanPhone.length === 13) {
    return /^\+380\d{9}$/.test(cleanPhone);
  }
  if (cleanPhone.startsWith("380") && cleanPhone.length === 12) {
    return /^380\d{9}$/.test(cleanPhone);
  }
  if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
    return /^0\d{9}$/.test(cleanPhone);
  }

  return false;
}

function normalizeUkrainianPhone(phone: string): string {
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  // Normalize to +380XXXXXXXXX format
  if (cleanPhone.startsWith("+380")) {
    return cleanPhone;
  }
  if (cleanPhone.startsWith("380")) {
    return "+" + cleanPhone;
  }
  if (cleanPhone.startsWith("0")) {
    return "+38" + cleanPhone;
  }

  return cleanPhone;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;

  // Validate required fields
  if (!name || !phone) {
    return {
      success: false,
      error: "Будь ласка, заповніть всі обов'язкові поля",
    };
  }

  // Validate phone number format
  if (!validateUkrainianPhone(phone)) {
    return {
      success: false,
      error:
        "Будь ласка, введіть коректний номер телефону (наприклад: +380XXXXXXXXX або 0XXXXXXXXX)",
    };
  }

  const normalizedPhone = normalizeUkrainianPhone(phone);

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const systemEmail = process.env.SYSTEM_EMAIL;

    if (!adminEmail || !systemEmail) {
      console.error("ADMIN_EMAIL or SYSTEM_EMAIL environment variable is not set");
      return {
        success: false,
        error: "Помилка конфігурації сервера",
      };
    }

    await resend.emails.send({
      from: systemEmail,
      to: adminEmail,
      subject: `Замовлення дзвінка від ${name}`,
      html: `
        <h2>Замовлення дзвінка</h2>
        <p><strong>Ім'я:</strong> ${name}</p>
        <p><strong>Телефон:</strong> <a href="tel:${normalizedPhone}">${normalizedPhone}</a></p>
        ${message ? `<p><strong>Повідомлення:</strong></p><p>${message.replace(/\n/g, "<br>")}</p>` : ""}
      `,
    });

    return {
      success: true,
      message: "Дякуємо! Ми зателефонуємо вам найближчим часом.",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: "Помилка при відправці повідомлення. Спробуйте ще раз пізніше.",
    };
  }
}
