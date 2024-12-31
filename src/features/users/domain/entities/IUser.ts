export interface IUser {
  id: number;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  registrationDate: Date;
  active: boolean;
  recoveryToken?: string | null;
  recoveryTokenExpires?: Date | null;
}