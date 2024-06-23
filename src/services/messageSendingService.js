
const { Container } = require('typedi');
const {
  formatErrorResponse, HttpException,
  MESSAGE_TYPES, EmailClient,
} = require('../utils');


class MessageSendingService {
  static sendMessageException(error) {
    return new HttpException.ServerError(formatErrorResponse('sendMessage', error));
  }

  static async sendMessage(content, receiver, sender, messageSendType) {
    if (!receiver || receiver.length === 0) {
      throw MessageSendingService.sendMessageException('invalidReceiver');
    }

    if (!sender || sender.length === 0) {
      throw MessageSendingService.sendMessageException('invalidSender');
    }

    let messageResponse;
    switch (messageSendType) {
      case MESSAGE_TYPES.EMAIL:
        messageResponse = await this.sendEmailMessage(content, receiver, sender);
        return messageResponse;
    //   case MESSAGE_TYPES.PUSH_NOTIFICATION:
    //     messageResponse = await this.sendPushNotification(content, receiver);
    //     return messageResponse;
      default:
        throw MessageSendingService.sendMessageException('invalidMessageType');
    }
  }

  static async sendEmailMessage(message, receiver, sender) {
    let formattedMessage;
    try {
      formattedMessage = await message.getFormattedMessage();
    } catch (err) {
      throw MessageSendingService.sendMessageException('formattedMessage');
    }

    const subject = message.getSubject();

    if (!subject || subject.length === 0) {
      throw MessageSendingService.sendMessageException('invalidSubject');
    }

    if (!receiver || receiver.length === 0) {
      throw MessageSendingService.sendMessageException('invalidReceiver');
    }

    if (!sender || sender.length === 0) {
      throw MessageSendingService.sendMessageException('invalidSender');
    }

    const emailClient = Container.get(EmailClient);
    return emailClient.sendEmail(subject, formattedMessage, receiver, sender);
  }

//   static async sendPushNotification(notification = {}, receiver) {
//     const { title, description, options } = notification;

//     if (!title || title.length === 0) {
//       throw MessageSendingService.sendMessageException('invalidTitle');
//     }

//     if (!description || description.length === 0) {
//       throw MessageSendingService.sendMessageException('invalidDescription');
//     }

//     if (!receiver || receiver.length === 0) {
//       throw MessageSendingService.sendMessageException('invalidReceiver');
//     }

//     const firebaseClient = Container.get(FirebaseClient);
//     return await firebaseClient.sendPushNotification(title, description, receiver, options);
//   }
}

module.exports = MessageSendingService;
