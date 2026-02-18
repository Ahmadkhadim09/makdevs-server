const validator = require('validator');

class Validators {
  static isValidEmail(email) {
    return validator.isEmail(email);
  }

  static isValidPassword(password) {
    return password && password.length >= 8 && password.length <= 30;
  }

  static isValidUrl(url) {
    return validator.isURL(url, { require_protocol: true });
  }

  static sanitizeHtml(text) {
    return validator.escape(text);
  }

  static isValidPhone(phone) {
    return validator.isMobilePhone(phone, 'any');
  }

  static isValidObjectId(id) {
    return validator.isMongoId(id);
  }

  static validateProjectData(data) {
    const errors = [];

    if (!data.title) errors.push('Title is required');
    if (!data.description) errors.push('Description is required');
    if (!data.category) errors.push('Category is required');
    if (!data.technologies || !Array.isArray(data.technologies)) {
      errors.push('Technologies must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateContactData(data) {
    const errors = [];

    if (!data.name) errors.push('Name is required');
    if (!this.isValidEmail(data.email)) errors.push('Valid email is required');
    if (!data.message) errors.push('Message is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validators;