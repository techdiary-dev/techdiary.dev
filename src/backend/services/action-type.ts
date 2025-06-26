export enum USER_SESSION_KEY {
  SESSION_TOKEN = "session_token",
  SESSION_USER_ID = "session_userId",
}

export interface ISession {
  id: string;
  user_id: string;
  token: string;
  device?: string;
}

export interface ISessionUser {
  id: string;
  name: string;
  username: string;
  email: string;
  profile_photo_url: string;
}

export type SessionResult =
  | { session: ISession; user: ISessionUser }
  | { session: null; user: null };
