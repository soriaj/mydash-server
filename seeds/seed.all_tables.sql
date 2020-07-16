BEGIN;

TRUNCATE lists, lists_items, events, finances, balances, users RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, full_name, email, password)
VALUES
   ('javier', 'Javier Soria', 'test.mail@email.com', '$2a$04$iVuExQgNmo0lmwtMytf5buVKb/qzxSgNmYB7AoPJgTyGulfwLW.9K'),
   ('user01', 'User One', 'user01.mail@email.com', '$2a$04$iVuExQgNmo0lmwtMytf5buVKb/qzxSgNmYB7AoPJgTyGulfwLW.9K');

INSERT INTO lists (name, content, user_id)
VALUES
   (
      'Packing Items',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      1
   ),
   (
      'ToDo',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      1
   ),
   (
      'Contacts',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      1
   );

INSERT INTO lists_items (name, list_id, user_id)
VALUES
   (
      '1 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
      1,
      1
   ),
   (
      '2 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
      1,
      1
   ),
   (
      '1 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor adadfasd adfda fsdafadsfd',
      2,
      1
   ),
   (
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor adadfasd adfda fsdafadsfd',
      1,
      1
   );

INSERT INTO events (event_name, event_loc, description, user_id)
VALUES
   (
      'Johns Birthday Party',
      'Sacramento',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      1
   ),
   (
      'Dinner with amor',
      'Sacramento',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      1
   ),
   (
      'Lunch with ISO',
      'Sacramento',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      1
   ),
   (
      'Tech Summit',
      'Sacramento',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      1
   );

INSERT INTO finances (type, description, amount, user_id)
VALUES
   (
      'credit',
      'Paycheck',
      1500.00,
      1 
   ),
   (
      'debit',
      'Grocercies',
      100.00,
      1 
   );

INSERT INTO balances (balance, user_id)
VALUES
   (
      0.00,
      1
   ),
   (
      21500.00,
      2
   );

COMMIT;