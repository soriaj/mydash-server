CREATE TABLE finances (
   id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
   date TIMESTAMP DEFAULT now() NOT NULL,
   type TEXT NOT NULL,
   description TEXT,
   amount MONEY NOT NULL
);