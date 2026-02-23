import { BaseComponent } from '../../core/Component';
import { appStore } from '../../core/Store';
import { io, Socket } from 'socket.io-client'; 
import { router } from '../../core/Router';
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
        const mode = params.get('mode') || 'something';
        const nick = params.get('nick');
        const left = params.get('left');
        const right = params.get('right');
        const room = params.get('room') || undefined;

        if ((mode != "remote" && mode != "local" && mode != "bot")
            || (mode === "remote" && (room === undefined || room === ""))) {
                router.navigate(`/menu`);
        }

        this.socket = io(import.meta.env.VITE_WSSURL, {
            path:"/api/game/socket.io",
            transports: ['websocket'],
            reconnection: true
        });


        this.socket.on('connect', () => console.log("Connected to Backend on 3003:", this.socket?.id));
        this.socket.on('connect_error', (err: any) => console.error("Socket Connection Error:", err));
        
        this.game = new PongGame('PongGame', mode, left, right ?? nick, this.socket, room);
        if (mode === 'remote' && room) {
            const name = appStore.getUser()?.username;
            console.log(`username: ${name}, room: ${room}`);
            this.game.joinRoom(room, `${name}`, `${name}`);
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

customElements.define('game-page', Game);
