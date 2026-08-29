export type SignupStep =
  | "SELECT_ROLE"
  | "SELECT_METHOD"
  | "EMAIL"
  | "PHONE"
  | "VERIFY"
  | "PASSWORD"
  | "BIRTH_DATE"
  | "COMPLETE";

export type Role = "USER" | "GUARDIAN";

export type SignupMethod = "EMAIL" | "PHONE" | "KAKAO" | null;
