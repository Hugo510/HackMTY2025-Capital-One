export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Account = {
  id: string;
  user_id: string;
  account_number: string;
  account_type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'frozen';
  created_at: string;
  updated_at: string;
};

export type CustomerData = {
  id: string;
  account_id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  date_of_birth: string | null;
  ssn_last_four: string;
  employment_status: string;
  annual_income: number;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  account_id: string;
  type: 'payment' | 'transfer' | 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  category: string;
  merchant: string | null;
  status: 'completed' | 'pending' | 'failed';
  transaction_date: string;
  created_at: string;
};

export type PersonalFinanceAlert = {
  id: string;
  user_id: string;
  alert_type: 'spending_limit' | 'low_balance' | 'due_date' | 'savings_goal';
  threshold_amount: number | null;
  category: string | null;
  is_active: boolean;
  notification_method: 'push' | 'email' | 'sms';
  created_at: string;
  updated_at: string;
};

export type VoiceEntry = {
  id: string;
  user_id: string;
  transcription: string;
  processed: boolean;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
};
