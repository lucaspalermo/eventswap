-- Migration 011: Atomic chat unread count increment
-- Replaces read-modify-write pattern with atomic SQL increment

CREATE OR REPLACE FUNCTION increment_unread_count(
  conv_id INT,
  field_name TEXT,
  msg_text TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF field_name = 'unread_count_1' THEN
    UPDATE conversations
    SET unread_count_1 = unread_count_1 + 1,
        last_message_at = NOW(),
        last_message_text = COALESCE(msg_text, last_message_text)
    WHERE id = conv_id;
  ELSIF field_name = 'unread_count_2' THEN
    UPDATE conversations
    SET unread_count_2 = unread_count_2 + 1,
        last_message_at = NOW(),
        last_message_text = COALESCE(msg_text, last_message_text)
    WHERE id = conv_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
