CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email_address VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  favorite_manufactures TEXT[] DEFAULT '{}'
);
