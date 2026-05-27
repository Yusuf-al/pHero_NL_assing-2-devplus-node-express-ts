export interface IUser {
  name: string;
  role: "contributor" | "maintainer";
  email: string;
  password: string;
}
