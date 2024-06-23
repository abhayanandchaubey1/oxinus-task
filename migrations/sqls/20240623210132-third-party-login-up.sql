-- Third party logins
CREATE TABLE account_third_party_logins (
  account_id INT NOT NULL REFERENCES accounts ON UPDATE CASCADE ON DELETE CASCADE,
  social_id VARCHAR(255) NOT NULL,
  registered_from varchar(27) NOT NULL,
  PRIMARY KEY (account_id, social_id, registered_from)	
);

ALTER TABLE account_third_party_logins
ADD CONSTRAINT check_registered_from
CHECK (registered_from IN ('GOOGLE','FACEBOOK','GSUITE'));