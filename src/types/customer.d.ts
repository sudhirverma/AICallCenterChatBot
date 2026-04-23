export interface CustomerAccount {
  account_id: string;
  routing_number: string;
  account_type: string;
  balance: number;
  currency: string;
}

export interface CustomerContact {
  phone?: string;
  email?: string;
  address?: string;
}

export interface Transaction {
  tx_id: string;
  date: string;
  amount: number;
  description?: string;
  counterparty?: string;
}

export interface Customer {
  customer_id: string;
  auth_token_b64?: string;
  name: string;
  dob?: string;
  ssn_simulated?: string;
  account?: CustomerAccount;
  contact?: CustomerContact;
  transactions?: Transaction[];
  notes?: string;
}
