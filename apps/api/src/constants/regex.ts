/**
 * Minimum eight characters, max 20 at least one letter and one number:
 *
 */
export const PASSWORD_REGEX_CHOICE_1 = {
  regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d`!@#$%&*()={}:;<>+'-]{8,30}$/,
  message: 'Password must be eight character long, at least one letter and one number',
};
