export const users = {
  validUser: {
    username: process.env.VALID_USER_USERNAME ?? '',
    email: process.env.VALID_USER_EMAIL ?? '',
    password: process.env.VALID_USER_PASSWORD ?? '',
  },
  invalidUser: {
    username: process.env.INVALID_USER_USERNAME ?? '',
    email: process.env.INVALID_USER_EMAIL ?? '',
    password: process.env.INVALID_USER_PASSWORD ?? '',
  },
} as const;

export type TestUser = typeof users.validUser;
