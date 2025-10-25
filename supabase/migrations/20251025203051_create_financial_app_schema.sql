/*
  # Esquema para Aplicación Financiera

  ## Descripción General
  Este esquema crea las tablas necesarias para una aplicación financiera móvil que permite:
  - Gestión de usuarios y autenticación
  - Administración de cuentas bancarias
  - Registro de datos de clientes
  - Seguimiento de pagos y movimientos
  - Gestión de finanzas personales con alertas

  ## 1. Nuevas Tablas

  ### `profiles`
  - `id` (uuid, primary key) - ID del usuario (referencia a auth.users)
  - `full_name` (text) - Nombre completo del usuario
  - `phone` (text) - Teléfono de contacto
  - `email` (text) - Email del usuario
  - `avatar_url` (text, nullable) - URL de foto de perfil
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de última actualización

  ### `accounts`
  - `id` (uuid, primary key) - ID único de la cuenta
  - `user_id` (uuid) - ID del propietario (referencia a profiles)
  - `account_number` (text) - Número de cuenta
  - `account_type` (text) - Tipo de cuenta (checking, savings, credit)
  - `balance` (numeric) - Balance actual
  - `currency` (text) - Moneda (USD, EUR, etc)
  - `status` (text) - Estado (active, inactive, frozen)
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de actualización

  ### `customer_data`
  - `id` (uuid, primary key) - ID único del registro
  - `account_id` (uuid) - Referencia a la cuenta
  - `address` (text) - Dirección del cliente
  - `city` (text) - Ciudad
  - `state` (text) - Estado/Provincia
  - `zip_code` (text) - Código postal
  - `date_of_birth` (date) - Fecha de nacimiento
  - `ssn_last_four` (text) - Últimos 4 dígitos SSN
  - `employment_status` (text) - Estado laboral
  - `annual_income` (numeric) - Ingreso anual
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de actualización

  ### `transactions`
  - `id` (uuid, primary key) - ID único de la transacción
  - `account_id` (uuid) - Referencia a la cuenta
  - `type` (text) - Tipo (payment, transfer, deposit, withdrawal)
  - `amount` (numeric) - Monto de la transacción
  - `description` (text) - Descripción
  - `category` (text) - Categoría (food, transport, entertainment, etc)
  - `merchant` (text, nullable) - Comercio/destinatario
  - `status` (text) - Estado (completed, pending, failed)
  - `transaction_date` (timestamptz) - Fecha de la transacción
  - `created_at` (timestamptz) - Fecha de registro

  ### `personal_finance_alerts`
  - `id` (uuid, primary key) - ID único de la alerta
  - `user_id` (uuid) - Referencia al usuario
  - `alert_type` (text) - Tipo (spending_limit, low_balance, due_date, savings_goal)
  - `threshold_amount` (numeric, nullable) - Monto límite
  - `category` (text, nullable) - Categoría específica
  - `is_active` (boolean) - Si está activa
  - `notification_method` (text) - Método (push, email, sms)
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de actualización

  ### `voice_entries`
  - `id` (uuid, primary key) - ID único del registro
  - `user_id` (uuid) - Referencia al usuario
  - `transcription` (text) - Texto transcrito
  - `processed` (boolean) - Si ya fue procesado
  - `entity_type` (text, nullable) - Tipo de entidad creada (account, transaction, etc)
  - `entity_id` (uuid, nullable) - ID de la entidad creada
  - `created_at` (timestamptz) - Fecha de creación

  ## 2. Seguridad (RLS)
  - Se habilita Row Level Security en todas las tablas
  - Los usuarios solo pueden ver y modificar sus propios datos
  - Se crean políticas específicas para SELECT, INSERT, UPDATE y DELETE

  ## 3. Notas Importantes
  - Todas las tablas usan UUID como clave primaria
  - Se incluyen timestamps automáticos
  - Las relaciones están claramente definidas con foreign keys
  - Los montos usan tipo numeric para precisión decimal
  - Las políticas RLS garantizan privacidad de datos
*/

-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  email text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Crear tabla de cuentas bancarias
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_number text NOT NULL,
  account_type text NOT NULL DEFAULT 'checking',
  balance numeric(12, 2) NOT NULL DEFAULT 0.00,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Crear tabla de datos del cliente
CREATE TABLE IF NOT EXISTS customer_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  zip_code text DEFAULT '',
  date_of_birth date,
  ssn_last_four text DEFAULT '',
  employment_status text DEFAULT '',
  annual_income numeric(12, 2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customer_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customer data"
  ON customer_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = customer_data.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own customer data"
  ON customer_data FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = customer_data.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own customer data"
  ON customer_data FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = customer_data.account_id
      AND accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = customer_data.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own customer data"
  ON customer_data FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = customer_data.account_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'payment',
  amount numeric(12, 2) NOT NULL,
  description text NOT NULL DEFAULT '',
  category text DEFAULT 'other',
  merchant text,
  status text NOT NULL DEFAULT 'completed',
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

-- Crear tabla de alertas de finanzas personales
CREATE TABLE IF NOT EXISTS personal_finance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  threshold_amount numeric(12, 2),
  category text,
  is_active boolean NOT NULL DEFAULT true,
  notification_method text NOT NULL DEFAULT 'push',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE personal_finance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON personal_finance_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON personal_finance_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON personal_finance_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON personal_finance_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Crear tabla de entradas por voz
CREATE TABLE IF NOT EXISTS voice_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transcription text NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  entity_type text,
  entity_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE voice_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voice entries"
  ON voice_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice entries"
  ON voice_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice entries"
  ON voice_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own voice entries"
  ON voice_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_data_account_id ON customer_data(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON personal_finance_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_entries_user_id ON voice_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_entries_processed ON voice_entries(processed);
