CREATE TABLE users (
   id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
   user_name TEXT NOT NULL,
   full_name TEXT NOT NULL,
   email TEXT NOT NULL, 
   password TEXT NOT NULL,
   date_created TIMESTAMP DEFAULT now() NOT NULL
);

ALTER TABLE lists
  ADD COLUMN
   user_id INTEGER REFERENCES users(id)
   ON DELETE CASCADE;

ALTER TABLE lists_items
  ADD COLUMN
   user_id INTEGER REFERENCES users(id)
   ON DELETE CASCADE;

ALTER TABLE events
  ADD COLUMN
   user_id INTEGER REFERENCES users(id)
   ON DELETE CASCADE;

ALTER TABLE finances
  ADD COLUMN
   user_id INTEGER REFERENCES users(id)
   ON DELETE CASCADE;

ALTER TABLE balances
  ADD COLUMN
   user_id INTEGER REFERENCES users(id)
   ON DELETE CASCADE;