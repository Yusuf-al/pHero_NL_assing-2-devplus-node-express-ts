export interface IUser {
  id: string;
  name: string;
  role: "contributor" | "maintainer";
  email: string;
  password: string;
}
