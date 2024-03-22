INSERT INTO user_balance_moving_transactions (
  user_id,
  delta_change,
  operation,
  unique_identificator
)
SELECT
  id,
  10000,
  'increase',
  gen_random_uuid()
FROM users
WHERE email IN ('admin-1@example.com','admin-2@example.com');
