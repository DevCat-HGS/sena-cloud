const mongoose = require('mongoose');

const excelShareSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('ExcelShare', excelShareSchema);