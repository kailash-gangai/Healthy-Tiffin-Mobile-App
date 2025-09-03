import * as Keychain from 'react-native-keychain';
import { getCustomerDetails } from '../../shopify/query/CustomerQuery';

// Define the service for storing customer data
const SERVICE = 'customer.auth';

// Define the data structure for customer tokens
export type CustomerTokens = {
  customerToken: string;
  tokenExpire: string;
};

// Function to save the customer token and expiry date to Keychain
export async function saveCustomerTokens(t: CustomerTokens) {
  try {
    await Keychain.setGenericPassword('customer', JSON.stringify(t), {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    console.log('Customer token and expiration saved to Keychain');
  } catch (error) {
    console.error('Error saving customer token to Keychain:', error);
  }
}

// Function to load the customer token and expiry date from Keychain
export async function loadCustomerTokens(): Promise<CustomerTokens | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });
    if (!credentials) return null;
    try {
      return JSON.parse(credentials.password) as CustomerTokens;
    } catch (error) {
      console.error('Error parsing customer token data:', error);
      return null;
    }
  } catch (error) {
    console.error('Error loading customer token from Keychain:', error);
    return null;
  }
}

// Function to clear the customer token and expiry date from Keychain
export async function clearCustomerTokens() {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
    console.log('Customer token and expiration cleared from Keychain');
  } catch (error) {
    console.error('Error clearing customer token from Keychain:', error);
  }
}

export async function checkCustomerTokens() {
  try {
    const customerTokenDetails = await loadCustomerTokens();

    if (!customerTokenDetails) return null;

    const { customerToken, tokenExpire } = customerTokenDetails;
    if (!customerToken || !tokenExpire) return null;
    const tokenExpiryTimestamp = new Date(tokenExpire).getTime();
    const currentTimestamp = new Date().getTime();

    if (tokenExpiryTimestamp < currentTimestamp) {
      console.log('Customer token has expired', tokenExpiryTimestamp);
      await clearCustomerTokens();
      return null;
    }
    const customerDetails = await getCustomerDetails(customerToken);
    if (!customerDetails || !customerDetails.customer.email) {
      return null;
    }
    let details = {
      email: customerDetails.customer.email,
      name: customerDetails.customer.displayName,
      id: customerDetails.customer.id,
      customerToken: customerToken,
      tokenExpire: tokenExpire,
    };
    return details;
  } catch (error) {
    console.error('Error checking customer tokens:', error);
    return null;
  }
}
