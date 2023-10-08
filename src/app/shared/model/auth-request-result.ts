export interface AuthRequestResult {
  isAuthorized: string;
  isNewUser: string;
  isProfileComplete: boolean;
  isEmailVeriried: boolean;
  token: string;
}
