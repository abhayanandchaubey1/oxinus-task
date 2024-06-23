const MessageSendingService = require('./messageSendingService');
const { Container } = require('typedi');
const { MESSAGE_TYPES } = require('../utils');
const { EmailMessage } = require('../models');
const config = require('../config');

class MessageService {

    static EMAIL = '/templates/email/email-notification.hbs';


    static async sendEmail(dto) {
      const subject = `Support email`;
      const data = {
        ...dto
      };
      const message = new EmailMessage(subject, MessageService.EMAIL, data);
      await MessageService.safeSendEmailMessage(message, dto.email, config.nodemailer.sender);
    }

    static async safeSendEmailMessage(message, email, senderEmail) {
      try {
        return await MessageSendingService.sendMessage(message, email, senderEmail, MESSAGE_TYPES.EMAIL);
      } catch (err) {
        /* eslint-disable-next-line no-console */
        console.log(`Error sending message for ${email}: ${err.message}`);
      }
      return false;
    }

    // static async safeSendPushNotification(notification, tokens = []) {
    //   try {
    //     return await MessageSendingService.sendMessage(notification, tokens,
    //       MESSAGE_TYPES.PUSH_NOTIFICATION);
    //   } catch (err) {
    //     /* eslint-disable-next-line no-console */
    //     console.log(`Error sending notification ${JSON.stringify(notification)}: ${err.message}`);
    //   }
    //   return false;
    // }

}

module.exports = MessageService;
