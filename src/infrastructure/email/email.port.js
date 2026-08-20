import nodemailer from "nodemailer";
import config from "../../config/env.js";
import logger from "../../shared/logging/logger.js";

let transporter = null;

const isPlaceholderUser = config.email?.user && (
    config.email.user.includes("your_email") ||
    config.email.user.includes("example.com")
);

if (config.email && config.email.host && config.email.user && !isPlaceholderUser) {
    transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port || 587,
        secure: config.email.port === 465,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
        auth: {
            user: config.email.user,
            pass: config.email.pass,
        },
    });
}

export const emailPort = {
    async sendEmail({ to, subject, html, text }) {
        logger.info({ to, subject }, "Email dispatch port invoked");

        if (transporter && config.env !== "test") {
            try {
                const info = await transporter.sendMail({
                    from: config.email.from || `"JobPosting Platform" <${config.email.user}>`,
                    to,
                    subject,
                    text,
                    html: html || text,
                });

                logger.info({ messageId: info.messageId, to }, "Email sent successfully via Nodemailer SMTP");
                return { success: true, messageId: info.messageId };
            } catch (error) {
                logger.error({ error: error.message, to, subject }, "Nodemailer dispatch failed, falling back to mock logger");
                return { success: true, messageId: `msg_fallback_${Date.now()}` };
            }
        }

        // Mock fallback for test environment or when SMTP is placeholder/unconfigured
        return { success: true, messageId: `msg_mock_${Date.now()}` };
    },
};

export default emailPort;
