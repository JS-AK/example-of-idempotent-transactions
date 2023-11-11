DROP TABLE IF EXISTS user_balance_moving_transactions;

CREATE TABLE user_balance_moving_transactions(
    id                              BIGSERIAL PRIMARY KEY,

    user_id                         BIGINT NOT NULL,

    delta_change                    INT NOT NULL,
    operation                       TEXT NOT NULL,
    unique_identificator            UUID UNIQUE NOT NULL,

    created_at                      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                      TIMESTAMP WITH TIME ZONE,

    CONSTRAINT user_balance_moving_transactions_users_user_id_fk
        FOREIGN KEY(user_id)
            REFERENCES users(id) ON DELETE CASCADE

);

CREATE INDEX idx__user_balance_moving_transactions__unique_identificator ON user_balance_moving_transactions(unique_identificator);
CREATE INDEX idx__user_balance_moving_transactions__user_id ON user_balance_moving_transactions(user_id);
