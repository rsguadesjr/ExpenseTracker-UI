export interface AuthRequestResult {
  isAuthorized: string;
  isNewUser: string;
  needToCompleteProfile: string;
  token: string;
}
