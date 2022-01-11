export const MIN_PASSWORD_LENGTH = 8;

export const getPasswordStrengthWord = (strength: number) => {
  switch (strength) {
    case 0:
      return "Weak";
    case 1:
      return "Weak";
    case 2:
      return "Weak";
    case 3:
      return "Good";
    case 4:
      return "Strong";
  }
};

export const passwordRequirementsMet = (password: string) =>
  password.length >= MIN_PASSWORD_LENGTH;
