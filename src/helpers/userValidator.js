"use strict";

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$?!%&*]).{8,50}$/;

// Password must contain;
//  at least one uppercase
//  at least one lowercase
//  at least one digit
//  More than 8 characters
//  less than 50 characters
//  at least one symbol between [@$?!%&*]

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

function validateEmail(email) {
  return emailRegex.test(email);
}

function validatePassword(password) {
  return passwordRegex.test(password);
}

module.exports = {
  validateEmail,
  validatePassword,
};
