import { BaseComponent } from '../../core/Component';
import { io, Socket } from 'socket.io-client'; 
import { PongGame } from "./Render";
import "../../css/button.css";
import "../../css/game.css";

export class Game extends BaseComponent {
    private game?: PongGame;
    private socket?: Socket;

    render() {
        this.setHtml(`
            <div class="canvas-wrapper">
                <canvas id="PongGame" class="pong-table" tabindex="1"></canvas>
            </div>
        `);

        setTimeout(() => {
            this.initGame();
        }, 100);
    }

    private initGame() {
        if (this.game) return;

        const canvas = document.getElementById('PongGame') as HTMLCanvasElement;
        if (!canvas) {
            console.error("Canvas element 'PongGame' not found in DOM");
            return;
        }

        const params = new URL(window.location.href).searchParams;
        const mode = params.get('mode') || 'local';
        const nick = params.get('nick') || undefined;
        const left = params.get('left') || undefined;
        const right = params.get('right') || undefined;
        const room = params.get('room') || undefined;

        this.socket = io("wss://localhost", {
            path:"/api/game/socket.io",
            transports: ['websocket'],
            reconnection: true
        });

        this.socket.on('connect', () => console.log("Connected to Backend on 3003:", this.socket?.id));
        this.socket.on('connect_error', (err) => console.error("Socket Connection Error:", err));

        
        this.game = new PongGame('PongGame', mode, left, right ?? nick, this.socket, room);
        if (mode === 'remote' && room) {
            const username: string = "username"; // || Guest
            const nickname: string = "nickname"; // || Guest
            console.log(`Attempting to join room: ${room}`);
            this.game.joinRoom(room, username, nickname);// send user data to the backend and fetch them from the user-management
        }
        this.game.loop();
    }

    disconnectedCallback() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = undefined;
        }
        this.game = undefined;
    }

    addEvents(): void {}
}

customElements.define('page-game', Game);
