-----------
-- accounts
CREATE TABLE accounts (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password CHAR(60), -- bcrypt hashes are always 60 bytes long
  status VARCHAR(17) NOT NULL,	
  created_on TIMESTAMPTZ DEFAULT current_timestamp,
  created_by BIGINT,
  updated_on TIMESTAMPTZ DEFAULT current_timestamp,
  updated_by BIGINT
);
CREATE TRIGGER update_accounts_modtime BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_on_column();
COMMENT ON TABLE accounts
  IS 'Table containing application accounts, eg. accounts which can login to system';
  
ALTER TABLE accounts
ADD CONSTRAINT check_status
CHECK (status IN ('ACTIVE','INACTIVE'));

-----------
-- User details
CREATE TABLE account_details (
  id BIGSERIAL PRIMARY KEY,
  account_id BIGINT NOT NULL REFERENCES accounts ON UPDATE CASCADE ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  phone VARCHAR(16) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birthday TIMESTAMPTZ,
  created_on TIMESTAMPTZ DEFAULT current_timestamp,
  created_by BIGINT NOT NULL,
  updated_on TIMESTAMPTZ DEFAULT current_timestamp,
  updated_by BIGINT NOT NULL
);
CREATE TRIGGER update_account_details_modtime BEFORE UPDATE ON account_details FOR EACH ROW EXECUTE PROCEDURE update_updated_on_column();

-----------
-- Login details
CREATE TABLE account_login_details (
  account_id BIGINT PRIMARY KEY REFERENCES accounts ON UPDATE CASCADE ON DELETE CASCADE,
  last_login TIMESTAMPTZ,
  last_wrong_login_attempt TIMESTAMPTZ,
  wrong_login_count INT DEFAULT 0 NOT NULL
);

-----------
-- Roles
CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(27) UNIQUE NOT NULL,
  status VARCHAR(17) NOT NULL 
);

ALTER TABLE roles
ADD CONSTRAINT check_status
CHECK (status IN ('ACTIVE','INACTIVE'));

INSERT INTO roles (name,status) VALUES ('USER','ACTIVE');

-----------
-- User roles
CREATE TABLE account_roles (
  account_id BIGINT NOT NULL REFERENCES accounts ON UPDATE CASCADE ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES roles ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY (account_id, role_id)
);