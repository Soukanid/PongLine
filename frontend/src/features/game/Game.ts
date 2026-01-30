import { BaseComponent } from '../../core/Component';
import { io } from 'socket.io-client';   //  <<===    npm install socket.io-client
// import { router } from '../../main';
import { PongGame } from "./Render";
import "../../css/button.css";
import "../../css/game.css";

export class Game extends BaseComponent {
    private game?: PongGame;
    render(){
        this.setHtml(`
        <div class="canvas-wrapper">
            <canvas id="PongGame" class="pong-table" tabindex="1"></canvas>
        </div>
        `)
        if (!this.game) {
            const params = new URL(window.location.href).searchParams;
            const mode = params.get('mode') || undefined;
            const nick = params.get('nick') || undefined;
            const left = params.get('left') || undefined;
            const right = params.get('right') || undefined;
            const newSocket = io("http://localhost:3000", {
                transports: ['websocket']
            });
            this.game = new PongGame('PongGame', mode, left, right ?? nick, newSocket);
            this.game.loop();
        }
    }
    addEvents(): void {
        
    }
}


customElements.define('page-game', Game);