-- Run once against your ClickHouse instance (e.g. clickhouse-client or HTTP POST to :8123).
-- session_type: ANON = client token in session_id; AUTHENTICATED = user id (UUID string) in session_id.
CREATE TABLE IF NOT EXISTS resource_views (
  resource_type   LowCardinality(String),
  resource_id     UUID,
  session_type    LowCardinality(String),
  session_id      String,
  referrer        Nullable(String),
  country_code    Nullable(String),
  viewed_at       DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(viewed_at)
ORDER BY (resource_type, resource_id, viewed_at);
