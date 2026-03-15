class Message {
  constructor({ id, senderId, text, type, fileUrl, fileName, createdAt }) {
    this.id = id;
    this.senderId = senderId;
    this.text = text || '';
    this.type = type || 'text';
    this.fileUrl = fileUrl || null;
    this.fileName = fileName || null;
    this.createdAt = createdAt || new Date();
  }

  isFile() {
    return this.type === 'file';
  }
}

module.exports = Message;
