export interface RegisterResponseModel {
  allowToLogin: boolean;
  emailVerificationLink: string;
  errorMessages: string[];
  isSuccess: boolean;
}
