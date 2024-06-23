-----------
-- Users
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password CHAR(60), -- bcrypt hashes are always 60 bytes long
  status VARCHAR(17) NOT NULL,	
  reserve1 VARCHAR(1), -- reserved column	
  reserve2 VARCHAR(1), -- reserved column	
  reserve3 VARCHAR(1), -- reserved column	
  reserve4 VARCHAR(1), -- reserved column	
  created_on TIMESTAMPTZ DEFAULT current_timestamp,
  created_by BIGINT,
  updated_on TIMESTAMPTZ DEFAULT current_timestamp,
  updated_by BIGINT
);
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_on_column();
COMMENT ON TABLE users
  IS 'Table containing application users, eg. users which can login to system';
  
ALTER TABLE users
ADD CONSTRAINT check_status
CHECK (status IN ('ACTIVE','INACTIVE'));

-----------
-- User details
CREATE TABLE user_details (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users ON UPDATE CASCADE ON DELETE CASCADE,
  first_name VARCHAR(70) NOT NULL,
  last_name VARCHAR(70) NOT NULL,
  reserve1 VARCHAR(1), -- reserved column	
  reserve2 VARCHAR(1), -- reserved column	
  reserve3 VARCHAR(1), -- reserved column	
  reserve4 VARCHAR(1), -- reserved column
  created_on TIMESTAMPTZ DEFAULT current_timestamp,
  created_by BIGINT NOT NULL,
  updated_on TIMESTAMPTZ DEFAULT current_timestamp,
  updated_by BIGINT NOT NULL
);
CREATE TRIGGER update_user_details_modtime BEFORE UPDATE ON user_details FOR EACH ROW EXECUTE PROCEDURE update_updated_on_column();

-----------
-- Login details
CREATE TABLE user_login_details (
  user_id BIGINT PRIMARY KEY REFERENCES users ON UPDATE CASCADE ON DELETE CASCADE,
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
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL REFERENCES users ON UPDATE CASCADE ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES roles ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);