CREATE TABLE two_phased_commit_transactions(
    id                              BIGSERIAL PRIMARY KEY,

    finished_at                     TIMESTAMP WITH TIME ZONE,
    idempotence_key                 TEXT NOT NULL UNIQUE,
    started_at                      TIMESTAMP WITH TIME ZONE NOT NULL,
    status                          TEXT NOT NULL,

    created_at                      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                      TIMESTAMP WITH TIME ZONE

);

CREATE INDEX idx__tpct__idempotence_key ON two_phased_commit_transactions(idempotence_key);
