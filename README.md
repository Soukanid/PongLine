ft_transcendence

A real-time multiplayer Pong platform built with a microservices architecture. This project implements a full-stack web application featuring live gameplay, chat, matchmaking, and a standalone CLI client that interacts with web users.

Overview
The application is designed as a distributed system rather than a monolith. It uses Fastify (Node.js) for high-performance backend services, Nginx as a reverse proxy/API gateway, and TypeScript for a unified codebase across frontend and backend.

Services are containerized using Docker, ensuring consistency across development and deployment environments. Real-time communication (game state and chat) is handled via WebSockets.

Architecture
The system is split into distinct microservices:

Auth Service: Handles JWT issuance, validation, OAuth (42/Google), and 2FA.

User Service: Manages profiles, friend relationships, and stats.

Chat Service: Handles global/private messaging and persistent history.

Game Service: core game engine, matchmaking queue, and state synchronization.

Frontend: A Single Page Application (SPA) built with Vanilla TypeScript and Tailwind CSS.

CLI Client: A terminal-based interface allowing cross-platform play against web users.

Features
Core Functionality
Real-Time Multiplayer: Low-latency Pong gameplay using WebSockets.

Authentication: Secure login via JWT (stored in HttpOnly cookies) and Two-Factor Authentication (2FA).

Live Chat: Global channels, private messaging, and user blocking.

Matchmaking: Automated queue system to pair players.

Stat Tracking: Match history, win/loss ratios, and leaderboards.

Advanced Modules
Microservices: Independent scaling and deployment of backend components.

CLI Game Client: Play directly from the terminal against web opponents.

Infrastructure Monitoring: Real-time metrics collection with Prometheus and visualization via Grafana.

Security: ModSecurity/WAF rules and strict content security policies.

Technology Stack
Frontend: TypeScript, Vite, Tailwind CSS

Backend: Node.js, Fastify, Prisma ORM

Database: PostgreSQL (Production) / SQLite (Dev)

Infrastructure: Docker, Nginx, Redis

Monitoring: Prometheus, Grafana

Installation & Usage
Prerequisites
Docker Engine

Docker Compose

Make

Running the Application
Clone the repository:

Bash
git clone https://github.com/your-username/ft_transcendence.git
cd ft_transcendence
Environment Setup:
Create a .env file in the root directory. You can use the provided example as a template:

Bash
cp .env.example .env
Build and Start:
Use Docker Compose to build images and start the services.

Bash
make up
# Or manually: docker-compose up --build -d
Access the App:

Web Interface: https://localhost

Grafana Dashboards: https://localhost/grafana (Default login: admin/admin)

Note: The application uses a self-signed SSL certificate. You will need to accept the browser security warning locally.

CLI Client Usage
The project includes a terminal-based client for headless gameplay.

Navigate to the CLI directory:

Bash
cd cli-client
Install dependencies:

Bash
npm install
Login and Play:

Bash
# Log in to your account
npm run start login

# Join the matchmaking queue
npm run start play
Project Structure
Bash
.
├── src/
│   ├── auth-service/     # Authentication & Authorization logic
│   ├── chat-service/     # WebSocket chat handlers
│   ├── game-service/     # Physics engine and game loops
│   └── user-service/     # User data management
├── frontend/             # SPA source code
├── cli/                  # Terminal game client
├── nginx/                # Gateway configuration
└── monitoring/           # Prometheus & Grafana config
