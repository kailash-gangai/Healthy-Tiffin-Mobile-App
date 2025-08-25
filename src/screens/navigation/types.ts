export type RootStackParamList = {
  Home: undefined;
  About: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgetPassword: undefined;
  ResetPassword: undefined;

  CodeVerification: undefined;
  SelectPreferences: undefined;
  DietaryPreferences: undefined;
  MedicalPreferences: undefined;

  OrderDetail: { orderId: string };
  Order: undefined;
  Account: undefined;
  // Add other screens here
  // e.g., Profile: { userId: string };
  // Settings: undefined;
  // etc.
};
