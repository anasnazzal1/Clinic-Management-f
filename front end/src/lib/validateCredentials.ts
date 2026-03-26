export interface CredentialErrors {
  username?: string;
  password?: string;
}

export function validateCredentials(
  username: string,
  password: string,
  required: boolean,
): CredentialErrors {
  const errors: CredentialErrors = {};

  if (required || username) {
    if (!username.trim()) {
      errors.username = 'Username is required.';
    } else if (username.length < 4) {
      errors.username = 'Username must be at least 4 characters.';
    } else if (/\s/.test(username)) {
      errors.username = 'Username must not contain spaces.';
    }
  }

  if (required || password) {
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    } else if (!/[a-zA-Z]/.test(password)) {
      errors.password = 'Password must contain at least 1 letter.';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least 1 number.';
    }
  }

  return errors;
}

export function hasCredentialErrors(errors: CredentialErrors): boolean {
  return Object.keys(errors).length > 0;
}
