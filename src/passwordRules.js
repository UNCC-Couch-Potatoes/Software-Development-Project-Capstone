export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

// Each rule shown in the checklist, and whether it's met yet
export function passwordChecks(password) {
  return [
    { label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: password.length >= PASSWORD_MIN_LENGTH },
    { label: 'An uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'A lowercase letter', met: /[a-z]/.test(password) },
    { label: 'A number', met: /[0-9]/.test(password) },
    { label: 'A symbol (like ! or #)', met: /[^A-Za-z0-9]/.test(password) },
  ];
}

// Returns an error message, or '' if the password is fine
export function passwordProblem(password, username = '') {
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }
  if (passwordChecks(password).some((check) => !check.met)) {
    return 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.';
  }
  const name = username.trim().toLowerCase();
  if (name.length >= 3 && password.toLowerCase().includes(name)) {
    return "Password can't contain your username.";
  }
  return '';
}