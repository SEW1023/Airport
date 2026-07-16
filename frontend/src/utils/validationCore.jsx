export const validateName = (name, fieldName = "Name") => {
  if (!name || !name.trim()) return `${fieldName} cannot be empty or just spaces!`;
  if (name.length > 100) return `${fieldName} must be under 100 characters!`;
  
  const nameRegex = /^[a-zA-Z0-9\s.,&'()-]+$/;
  if (!nameRegex.test(name)) return `${fieldName} contains invalid special characters!`;
  
  return null;
};

export const validateEmail = (email) => {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid Email Format!";
  return null;
};

export const validatePhone = (phone, fieldName = "Contact Hotline") => {
  if (!phone) return null;
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length !== 10) return `${fieldName} must contain exactly 10 digits!`;
  if (digitsOnly[0] !== '0') return `${fieldName} must start with "0"!`;
  return null;
};

export const validateLength = (text, maxLength = 200, fieldName = "Address") => {
  if (text && text.length > maxLength) return `${fieldName} is too long! Max ${maxLength} characters.`;
  return null;
};

export const validateNumeric = (value, fieldName = "Amount") => {
  if (!value) return `${fieldName} is required!`;
  if (isNaN(value) || Number(value) <= 0) return `${fieldName} must be a positive number greater than 0!`;
  return null;
};