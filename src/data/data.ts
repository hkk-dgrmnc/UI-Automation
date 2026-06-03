export const users = {
  validUser: {
    email: process.env.VALID_USER_EMAIL ?? '',
    password: process.env.VALID_USER_PASSWORD ?? '',
  },
  invalidUser: {
    email: process.env.INVALID_USER_EMAIL ?? '',
    password: process.env.INVALID_USER_PASSWORD ?? '',
  },
} as const;

export const products = {
  defaultSearchKeyword: process.env.DEFAULT_PRODUCT_SEARCH_KEYWORD ?? '',
  alternativeSearchKeyword: process.env.ALTERNATIVE_PRODUCT_SEARCH_KEYWORD ?? '',
  unavailableSearchKeyword:
    process.env.UNAVAILABLE_PRODUCT_SEARCH_KEYWORD ?? 'urunbulunmaztest',
} as const;

export const addresses = {
  defaultAddress: {
    firstName: process.env.ADDRESS_FIRST_NAME ?? '',
    lastName: process.env.ADDRESS_LAST_NAME ?? '',
    phone: process.env.ADDRESS_PHONE ?? '',
    city: process.env.ADDRESS_CITY ?? '',
    district: process.env.ADDRESS_DISTRICT ?? '',
    addressLine: process.env.ADDRESS_LINE ?? '',
  },
} as const;

export const payment = {
  testCard: {
    cardHolder: process.env.PAYMENT_CARD_HOLDER ?? '',
    cardNumber: process.env.PAYMENT_CARD_NUMBER ?? '',
    expireMonth: process.env.PAYMENT_EXPIRE_MONTH ?? '',
    expireYear: process.env.PAYMENT_EXPIRE_YEAR ?? '',
    cvv: process.env.PAYMENT_CVV ?? '',
  },
} as const;

export type TestUser = typeof users.validUser;
export type TestAddress = typeof addresses.defaultAddress;
export type TestPaymentCard = typeof payment.testCard;
