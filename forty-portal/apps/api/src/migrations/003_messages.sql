-- ── Messages ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         TEXT         NOT NULL,
  is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_sender_idx    ON messages(sender_id,    created_at);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON messages(recipient_id, created_at);
CREATE INDEX IF NOT EXISTS messages_convo_idx     ON messages(created_at)
  WHERE sender_id IS NOT NULL AND recipient_id IS NOT NULL;
