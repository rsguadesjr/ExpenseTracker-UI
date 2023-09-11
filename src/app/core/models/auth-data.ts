export interface AuthData {
  accessToken: string;
  refreshToken: string;
  email: string;
  name: string;
  photoUrl: string;
  role: string | string[];
  userId: string;
  aud: string;
  exp: number;
  iss: string;
}
