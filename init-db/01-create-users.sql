CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email_address VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  favorite_manufactures TEXT[] DEFAULT '{}'
);
