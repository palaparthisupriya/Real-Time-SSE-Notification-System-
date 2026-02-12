CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    channel VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_channel_id ON events(channel, id);

CREATE TABLE user_subscriptions (
    user_id INTEGER NOT NULL,
    channel VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, channel)
);

-- Seed users (implicitly by subscription)
INSERT INTO user_subscriptions (user_id, channel)
VALUES 
(1, 'alerts'),
(1, 'test-channel'),
(2, 'alerts');
