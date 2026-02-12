# SSE Notification Service

A **real-time notification service** built with **Server-Sent Events (SSE)**, **Node.js**, and **PostgreSQL**, fully containerized with **Docker** and **Docker Compose**.  

This project demonstrates persistent connections, event persistence, event replay, user subscriptions, and real-time notifications—similar to live news feeds, stock tickers, or activity streams.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [API Endpoints](#api-endpoints)
- [Testing SSE](#testing-sse)
- [Verification Checklist](#verification-checklist)
- [License](#license)

---

## Features

- **Publish Events:** Send notifications to a channel.
- **Subscribe/Unsubscribe:** Users can manage channel subscriptions.
- **SSE Stream:** Real-time event streaming to connected clients.
- **Heartbeat:** Periodic SSE heartbeat to prevent connection timeouts.
- **Event Replay:** Supports `Last-Event-ID` for missed events recovery.
- **Historical Events:** Paginated retrieval of past events.
- Fully containerized with **Docker** and **Docker Compose**.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Containerization:** Docker, Docker Compose
- **SSE:** Server-Sent Events for real-time communication

---

## Project Structure

sse-notification-service/
│
├─ seeds/ # SQL scripts to create tables & seed data
├─ src/ # Application source code
│ ├─ routes.js # API routes
│ └─ ...
├─ .env.example # Environment variables template
├─ Dockerfile # Dockerfile for app
├─ docker-compose.yml # Docker Compose configuration
├─ submission.json # Test users configuration
└─ README.md # Project documentation


---

## Setup & Installation

1. **Clone the repository**

```bash
git clone https://github.com/<username>/sse-notification-service.git
cd sse-notification-service
Create .env from .env.example

copy .env.example .env   # Windows
# or
cp .env.example .env     # Linux / Mac
Build and start Docker containers

docker-compose up --build
Verify services are running

App: http://localhost:8080

PostgreSQL: Port 5432 (credentials from .env)

Environment Variables
Variable	Description	Example
DATABASE_URL	PostgreSQL connection string	postgresql://user:password@db:5432/eventsdb
PORT	Application port	8080
Database Seeding
The seeds/ directory contains SQL scripts to:

Create events table with an index on (channel, id)

Create user_subscriptions table with unique (user_id, channel) constraint

Insert sample users, channels, and events for testing

Scripts automatically run on container startup.
---

## API Endpoints
1. Publish Event
POST /api/events/publish
Body:

{
  "channel": "test-channel",
  "event_type": "notification",
  "payload": {
    "message": "Hello SSE!"
  }
}
Success: 202 Accepted
Error: 400 Bad Request (missing fields)

2. Subscribe to Channel
POST /api/events/channels/subscribe
Body:

{
  "userId": 1,
  "channel": "alerts"
}
Success: 201 Created

3. Unsubscribe from Channel
POST /api/events/channels/unsubscribe
Body:

{
  "userId": 1,
  "channel": "alerts"
}
Success: 200 OK

4. SSE Stream
GET /api/events/stream?userId=1&channels=test-channel
Response headers:

Content-Type: text/event-stream

Cache-Control: no-cache

Connection: keep-alive

Supports:

Heartbeat: : heartbeat\n\n every 30s

Event Replay: Last-Event-ID header

User Subscriptions: Only subscribed channels are streamed

5. Event History
GET /api/events/history?channel=test-channel&afterId=2&limit=5
Paginated retrieval of past events.

Default limit: 50.

Testing SSE
Example using curl (Windows):

curl -N -H "Last-Event-ID: 0" "http://localhost:8080/api/events/stream?userId=1&channels=test-channel"
Publishing events:

curl -X POST http://localhost:8080/api/events/publish -H "Content-Type: application/json" -d "{\"channel\":\"test-channel\",\"event_type\":\"notification\",\"payload\":{\"message\":\"Hello SSE!\"}}"
Fetching history:

curl -X GET "http://localhost:8080/api/events/history?channel=test-channel&limit=2"
