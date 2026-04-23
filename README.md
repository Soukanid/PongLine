# 🏓 PongLine

> **A real-time, competitive Pong platform wrapped in a cypherpunk terminal aesthetic.** ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![42 Network](https://img.shields.io/badge/42_Network-000000?style=for-the-badge&logo=42&logoColor=white)

Welcome to **PongLine**, a full-stack Single Page Application (SPA) built as the capstone `ft_transcendence` project for the 42 Network. It features real-time multiplayer gameplay, a live chat system, secure authentication, and a completely custom, native web-component frontend designed to look like a retro hacker terminal.

## ✨ Features

### 🕹️ The Game
* **Real-Time Multiplayer:** Low-latency Pong matches synced seamlessly between clients.
* **Matchmaking & Invites:** Challenge your friends to a match directly through the chat interface.

### 💻 Retro SPA Frontend
* **Terminal UI:** A fully custom, zero-framework Single Page Application built using raw TypeScript Web Components (`BaseComponent`).
* **Cypherpunk Aesthetic:** Monospaced fonts, neon green-on-black styling, and command-line style buttons (e.g., `[ ENABLE_2FA.sh ]`).
* **Live DOM Updates:** Seamless UI transitions without page reloads (e.g., instant Base64 avatar rendering).

### 🔒 Security & Authentication
* **42 Intra OAuth:** Log in securely using 42 Network credentials.
* **Two-Factor Authentication (2FA):** Time-based One-Time Password (TOTP) integration using Speakeasy and QR codes.
* **JWT Sessions:** HttpOnly cookies for secure session management.
* **XSS Protection:** Strict DOM sanitization to prevent Cross-Site Scripting in the live chat.

### 💬 Social System
* **Live Chat:** Real-time messaging with timestamped logs.
* **Friend Management:** Send invites, accept requests, and track who is currently online.
* **Block System:** Mute toxic users and prevent them from sending messages or game invites.

---

## 🏗️ Architecture

PongLine is built using a modern **Microservices Architecture** to ensure scalability and separation of concerns.

- **Frontend:** Custom TypeScript Web Components, Tailwind CSS (Retro Theme).
- **Backend:** Fastify (Node.js).
- **Database:** Prisma ORM with SQLite.
- **Infrastructure:** Fully containerized with Docker & Docker Compose.

---

## 🚀 Getting Started

### Prerequisites
* [Docker](https://www.docker.com/) and `docker-compose` installed on your machine.
* A `.env` file configured with your 42 Intra API keys, JWT secrets, and database URLs.

### Installation

1. **Clone the repository:**
   git clone https://github.com/Soukanid/PongLine.git
   cd PongLine

2. **Build and spin up the containers:**
   We use a `Makefile` to handle the Docker orchestration smoothly.
   make up

3. **Access the application:**
   Open your browser and navigate to `http://localhost:<PORT>` (Check your `.env` or `docker-compose.yml` for the exposed port).

4. **Shut down the system:**
   make down

---

## 👩‍💻 About the Author

Developed by **Soukaina Nid Bella** ([@Soukanid](https://github.com/Soukanid)) as part of the 1337 Coding School (42 Network) curriculum in Morocco. 

If you like the retro aesthetic or want to chat about microservices, C++, or robotics, feel free to reach out!

---
*Initializing SYSTEM_LOGOUT.exe... Goodbye.*
