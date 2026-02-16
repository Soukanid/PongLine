# PongLine...

**ft_transcendence** is the final project of the Common Core curriculum at 42. It is a robust, real-time multiplayer online Pong contest platform.

Unlike a traditional monolithic web application, this project is architected as a distributed system using **Microservices**. It features a high-performance backend built with **Fastify**, a responsive **TypeScript** frontend, and a standalone **CLI Game Client** that allows terminal users to compete against web players in real-time.

## Overview

The application is designed to simulate a production-grade environment. All services are containerized using **Docker** and orchestrated via **Docker Compose**. Traffic is managed by an **Nginx** API Gateway/Reverse Proxy, ensuring secure and efficient communication between the client and the microservices swarm.

## Architecture

The system is decomposed into the following microservices:

* **API Gateway (Nginx):** Single entry point handling SSL termination, load balancing, and route dispatching.
* **Auth Service:** Manages Identity, JWT issuance (HttpOnly Cookies), OAuth (42/Google), and Two-Factor Authentication (2FA).
* **User Service:** Handles user profiles, friend relationships, blocking, and social stats.
* **Chat Service:** persistent real-time messaging, global channels, and private DMs using WebSockets.
* **Game Service:** The core authoritative game server. Handles physics simulation, matchmaking queues, and state synchronization.
* **Notification Service:** Real-time event dispatching (game invites, friend requests).

## Features

### Gameplay & Experience
* **Real-Time Pong:** Server-authoritative physics ensuring a cheat-free, lag-compensated experience.
* **Matchmaking:** Automated queue system to pair players of similar skill levels.
* **Tournament System:** Support for creating and managing bracket-style tournaments (4+ players).
* **Cross-Platform CLI:** A fully functional terminal client allowing users to play against web opponents via API integration.
* **Game Customization:** Options for different map skins and power-ups.

### Social & User Management
* **Live Chat:** Global chat rooms and direct private messaging.
* **Friend System:** Send/Accept requests, view online status, and invite friends to games.
* **User Profiles:** Detailed statistics, match history, and win/loss ratios.
* **Blocking:** Ability to block users to prevent messages and game invites.

### Security
* **Authentication:** Secure JWT implementation using HttpOnly/Secure cookies (XSS protection).
* **2FA:** Time-based One-Time Password (TOTP) integration (Google Authenticator).
* **WAF:** ModSecurity integration for protection against common web attacks.
* **GDPR Compliance:** Features for user data anonymization and account deletion.

### DevOps & Observability
* **Microservices:** Independent deployment and scaling of backend components.
* **Monitoring Stack:** Real-time metrics collection with **Prometheus** and visualization dashboards via **Grafana**.
* **Log Management:** Centralized logging infrastructure.

### Accessibility
* **Multi-language Support:** Interface available in English, French, and Spanish.
* **Visual Accessibility:** High-contrast mode and screen reader support for visually impaired users.
* **Responsive Design:** Seamless experience across Desktop, Tablet, and Mobile.

## Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | TypeScript, Tailwind CSS, Vite |
| **Backend Framework** | Node.js, Fastify |
| **Database** | PostgreSQL (Production), SQLite (Dev), Prisma ORM |
| **Real-Time** | WebSockets (ws), Socket.io |
| **Infrastructure** | Docker, Docker Compose, Nginx |
| **Monitoring** | Prometheus, Grafana |

## Installation & Usage

### Prerequisites
* Docker Engine
* Docker Compose
* Make
* Node.js (Optional, for running CLI client locally)

### Quick Start

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/ft_transcendence.git](https://github.com/your-username/ft_transcendence.git)
    cd ft_transcendence
    ```

2.  **Environment Configuration**
    Create the necessary `.env` file from the example template.
    ```bash
    cp .env.example .env
    ```
    *Edit `.env` to add your API keys (42 API, Google OAuth) and database secrets.*

3.  **Launch Application**
    Use the Makefile to build and start the container swarm.
    ```bash
    make up
    ```
    *Alternatively:* `docker-compose up --build -d`

4.  **Access Points**
    * **Web Application:** `https://localhost`
    * **Grafana Dashboards:** `https://localhost/grafana` *(Default: admin/admin)*
    * **Prometheus:** `https://localhost/prometheus`

    *> Note: The application runs on HTTPS with a self-signed certificate. Please accept the security warning in your browser.*

## CLI Client Guide

To access the game via the terminal:

1.  **Navigate to the CLI directory:**
    ```bash
    cd cli-client
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Commands:**
    * `npm run start login` - Authenticate with the web platform.
    * `npm run start play` - Join the matchmaking queue.
    * `npm run start chat` - Open the terminal chat interface.

## Project Structure

```text
.
├── src/
│   ├── auth-service/     # JWT, OAuth, 2FA Logic
│   ├── chat-service/     # WebSocket Handlers
│   ├── game-service/     # Physics Engine & Matchmaking
│   └── user-service/     # Profile & Social Management
├── frontend/             # SPA Source Code
├── cli-client/           # Terminal Game Client
├── nginx/                # API Gateway Configuration
├── monitoring/           # Prometheus & Grafana Configuration
└── docker-compose.yml    # Orchestration
