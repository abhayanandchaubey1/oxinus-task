const { parseHbsTemplate, getResourcesFileSource } = require('../utils');

class EmailMessage {
  constructor(subject, resourcePath, data) {
    this.subject = subject;
    this.resourcePath = resourcePath;
    this.data = data;
  }

  getSubject() {
    return this.subject || '';
  }

  async getFormattedMessage() {
    if (!this.resourcePath) {
      return '';
    }

    const source = await getResourcesFileSource(this.resourcePath);
    return parseHbsTemplate(source, this.data);
  }
}

module.exports = EmailMessage;
