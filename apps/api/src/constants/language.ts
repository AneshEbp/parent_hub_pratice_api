const responseMessages = {
  EN: {
    CANNOT_UPDATE_SAME_PASSWORD: 'New password can not be old password',
    PASSWORD_ALREADY_SET: 'Password already added',
    PASSWORD_SET_SUCCESSFULLY: 'Password added successfully.',
    UNAUTHORIZED_USER: 'Unauthorized.',
    EMAIL_ALREADY_EXISTS: 'Email not available.',
    EMAIL_DOES_NOT_EXIST: 'Email does not exists.',
    VERIFICATION_CODE_SENT_TO_EMAIL:
      'Verification code sent to your email please use that code to verify your email',
    VERIFICATION_CODE_SENT_TO_PHONE:
      'Verification code sent to your phone number please use that code to verify your phone number.',
    VERIFICATION_CODE_VALID_SET_PASSWORD: 'Code verified successfully. Please reset your password.',
    PHONE_UPDATED: 'Phone number updated',
    LOGIN_SUCCESS: 'Login success',
    FAILED_TO_AUTHORIZE_FACEBOOK: 'Failed to authorize facebook account.',
    FAILED_TO_AUTHORIZE_APPLE: 'Failed to authorize apple account.',
    FAILED_TO_AUTHORIZE_GOOGLE: 'Failed to authorize google account.',
    VERIFICATION_CODE_ALREADY_SENT: 'Verification code already sent',
    TOO_MANY_ATTEMPTS: 'Too many attempts. Please try again.',
    INVALID_VERIFICATION_CODE: 'Invalid verification code',
    INVALID_CREDENTIALS: 'Invalid login credentials.',
    PASSWOD_CHANGE_PASSWORD_NOT_MATCHED:
      'Password you have provided does not match with your existing password.',
    PASSWORD_RESET_CODE_SENT: 'Password reset code sent.',
    PASSWORD_CHANGED_SUCCESSFULLY: 'Password changed succesfully',
    PROFILE_UPDATED_SUCCESSFULLY: 'Profile updated successfully.',
    LOGGED_OUT_SUCCESSFULLY: 'Logged out successfully.',
    TOKEN_REFRESH_SUCCESS: 'Token refreshed successfully.',
    CANNOT_UPDATE_SAME_EMAIL: 'Can not update the same email address',
    EMAIL_UPDATED: 'Email verified and updated successfully',
    PROFILE: {
      INVALID_EXTENSION: 'Invalid profile image extension.',
    },
    FAILED_TO_AUTHORIZE_TIKTOK: 'Failed to authorize tiktok account.',
    BIOMETRIC_ENABLE_SUCCESS: 'Biometric enabled successfully',
    BIOMETRIC_ALREADY_ENABLE: 'Biometric already set as enabled.',

    COIN_ADDED_SUCCESSFULLY: 'Coin added successfully',
    COIN_LISTED_SUCCESSFULLY: 'Coin listed successfully',
    COIN_PACK_NOT_FOUND: 'Coin package not found',
    RECEIPT_ALREADY_VERIFIED: 'Receipt already verified',
    DISPOSABLE_EMAIL_NOT_ALLOWED: 'Email with this domain is not allowed',
    NON_EMPTY_FIELD: (field) => `${field} can not be empty`,
    REQUIRED_FIELD: (field) => `${field} is required field.`,
    NOT_FOUND_ERROR: (field) => `${field} not found.`,
    STATUS_CHANGED: (field, newStatus) => `${field} status updated to ${newStatus} successfully.`,
    FAQ_LISTING: 'FAQs listed successfully',

    MIN_LENGTH: (field: string, min: string | number) =>
      `${field} should have minimum ${min} characters.`,

    MAX_LENGTH: (field: string, max: string | number) =>
      `${field} should not exceed ${max} characters.`,

    INVALID_FIELD: (field) => `${field} is invalid`,

    DATE_VALIDATION: (field, relatedField) => `${field} should be greater than ${relatedField}.`,

    MUST_BE_ONE_OF_ARRAY: (field, options: Array<string>) =>
      `${field} should be one of following ${options.join(', ')}`,
    CREATE_SUCCESS: (field) => `${field} has been created successfully.`,
    CREATE_FAILURE: (field) => `${field} creation failed.`,
    UPDATE_FAILURE: (field) => `${field} update failed.`,
    UPDATE_SUCCESS: (field) => `${field}  has been updated successfully.`,
    DELETE_SUCCESS: (field) => `${field}  has been deleted successfully.`,
    REMOVE_SUCCESS: (field) => `${field}  has been removed successfully.`,

    DAY_OF_MONTH_SAME_AS_START_DATE: 'Day of month must be equal to start date',
    MONTH_OF_YEAR_SAME_AS_START_DATE: 'Month of year must be equal to start date',
    DAY_OF_WEEK_SAME_AS_START_DATE: 'Day of week must be same as that of start date',
    WEEK_OF_MONTH_SAME_AS_START_DATE: 'Week of month must be same as that of start date',
    WEEK_OF_MONTH_MUST_BE_FIELD: (field) => `Week of month must be one of following ${field}`,
    AT_LEAST_ONE_INSTANCE_REQUIRED: 'At least one instance is required.',

    SOMETHING_WENT_WRONG: 'Something went wrong',
    SOME_APPOINTMENT_TYPE_ID_INVALID: 'Some of provided appointment ids are invalid',
    SOME_INVALID_ADDRESS_ID: 'Some of provided address ids are invalid',
    SOME_COACHES_ID_INVALID: 'Some of provided coach ids are invalid',
    INVALID_CLASS_TYPE_ID: 'Invalid class type id provided. Please provide a valid id.',
    INVALID_ADDRESS_ID: 'Invalid address id provided. Please provide a valid id.',
    INVALID_MONGODB_ID: 'Invalid id provided. Please provide a valid id.',
    S3_VALID_SIZES_ENUM: 'Each size must be one of valid type (small, medium, original)',
    S3_KEY_NOT_FOUND: 'File not Found.',
    APPOINTMENT_CANCELED: 'Appointment canceled.',
    SAVED_CALENDER_FILTER: 'Calender filter saved successfully',
    EMAIL_TEMPLATE_LISTINGS: 'Email Template listings',
    EMAIL_TEMPLATE_CREATE: 'Email Template created successfully',
    EMAIL_TEMPLATE_UPDATE: 'Email Template updated successfully',
    EMAIL_TEMPLATE_DELETE: 'Email Template deleted successfully',
    EMAIL_BUILDER_LIST: 'Email templates listed successfully',
    REQUIRED_FILE_KEY: 'File key is required field.',
  },
};
const lang = process.env.SYSTEM_LANGUAGE || 'EN';

const messages = lang == 'EN' ? responseMessages.EN : responseMessages[lang];

export default messages;
