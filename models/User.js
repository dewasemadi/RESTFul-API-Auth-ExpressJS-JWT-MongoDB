const mongoose = require('mongoose');
const Joi = require('joi');

/*
 *
 *why using joi?
 *because costume validation on mongoose only work on save/create method
 *
 */

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minLength: 8,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
}).set('timestamps', true);

// at least one uppercase letter, one lowercase letter, and one number
const passwordPattern = `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])`;

const registerValidation = Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).regex(RegExp(passwordPattern)).required().messages({
    'string.pattern.base': 'Password must have at least one uppercase letter, one lowercase letter, and one number',
  }),
});

const loginValidation = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).regex(RegExp(passwordPattern)).required().messages({
    'string.pattern.base': 'Your password is wrong',
  }),
});

const changePasswordValidation = Joi.object().keys({
  new_password: Joi.string().min(8).regex(RegExp(passwordPattern)).required().messages({
    'string.pattern.base': 'Password must have at least one uppercase letter, one lowercase letter, and one number',
    'any.only': 'Password and password confirmation does not match',
  }),
  new_password_confirmation: Joi.string()
    .min(8)
    .regex(RegExp(passwordPattern))
    .required()
    .valid(Joi.ref('new_password'))
    .messages({
      'any.only': 'Password and password confirmation does not match',
    }),
});

const User = mongoose.model('User', userSchema);
module.exports = { User, registerValidation, loginValidation, changePasswordValidation };
