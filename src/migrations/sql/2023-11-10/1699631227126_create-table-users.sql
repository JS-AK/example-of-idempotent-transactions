CREATE TABLE users(
    id                              BIGSERIAL PRIMARY KEY,

    balance                         BIGINT NOT NULL,
    email                           TEXT NOT NULL UNIQUE,

    created_at                      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                      TIMESTAMP WITH TIME ZONE

);

CREATE INDEX idx__users__email ON users(email);
