// src/utils/validators.js
// Input Validation Utilities
// Kullanım: const { validateUUID, validateEmail, validateBio } = require('../utils/validators')

const REGEX = {
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,50}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, // min 8 chars, 1 letter, 1 number
  URL: /^https?:\/\/.+/i,
};

module.exports = {
  validateUUID: (value, fieldName = 'ID') => {
    if (!value || !REGEX.UUID.test(value)) {
      return {
        valid: false,
        error: `Invalid ${fieldName} format`
      };
    }
    return { valid: true };
  },

  validateEmail: (value) => {
    if (!value || !REGEX.EMAIL.test(value)) {
      return {
        valid: false,
        error: 'Invalid email format'
      };
    }
    return { valid: true };
  },

  validateUsername: (value) => {
    if (!value || !REGEX.USERNAME.test(value)) {
      return {
        valid: false,
        error: 'Username must be 3-50 characters, alphanumeric and underscore only'
      };
    }
    return { valid: true };
  },

  validatePassword: (value) => {
    if (!value || !REGEX.PASSWORD.test(value)) {
      return {
        valid: false,
        error: 'Password must be at least 8 characters with letters and numbers'
      };
    }
    return { valid: true };
  },

  validateBio: (value, maxLength = 500) => {
    if (value && value.length > maxLength) {
      return {
        valid: false,
        error: `Bio must be less than ${maxLength} characters`
      };
    }
    return { valid: true };
  },

  validateCountry: (value) => {
    if (!value || value.length < 2 || value.length > 100) {
      return {
        valid: false,
        error: 'Country must be between 2-100 characters'
      };
    }
    return { valid: true };
  },

  validateCity: (value) => {
    if (!value || value.length < 2 || value.length > 100) {
      return {
        valid: false,
        error: 'City must be between 2-100 characters'
      };
    }
    return { valid: true };
  },

  validateGender: (value) => {
    const validGenders = ['Male', 'Female', 'Other'];
    if (!value || !validGenders.includes(value)) {
      return {
        valid: false,
        error: `Gender must be one of: ${validGenders.join(', ')}`
      };
    }
    return { valid: true };
  },

  validateContent: (value, minLength = 1, maxLength = 5000) => {
    if (!value || value.length < minLength || value.length > maxLength) {
      return {
        valid: false,
        error: `Content must be between ${minLength}-${maxLength} characters`
      };
    }
    return { valid: true };
  },

  validateAvatarUrl: (value) => {
    if (value && !REGEX.URL.test(value)) {
      return {
        valid: false,
        error: 'Avatar URL must be a valid HTTP/HTTPS URL'
      };
    }
    return { valid: true };
  }
};