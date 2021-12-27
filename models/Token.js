const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // reference to user collection
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  flag: {
    type: String,
    default: 'EMAIL_VERIFICATION',
    required: true,
  },
  expires_in: {
    type: Date,
    default: Date.now(),
    index: { expires: '60m' }, // auto delete document after 1 hours
  },
});

const Token = mongoose.model('Token', tokenSchema);
module.exports = { Token };
