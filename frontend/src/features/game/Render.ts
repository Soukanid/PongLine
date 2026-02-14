
interface GameState {
	player1: string;
	player2: string;
	paddle1Y: number;
	paddle2Y: number;
	score_plr1: number;
	score_plr2: number;
	ballX: number;
	ballY: number;
	mode?: string;
	timestamp: number;
}

export class PongGame {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	
	private width = 800;
	private height = 500;
	
	private game!: GameState;
	private currentGameId!: string;
	private isPaused: boolean = false;
	private isStarted: boolean = false;
	private socket: any;
	private roomId?: string;
	private keys: { [key: string]: boolean } = {};

	private ballVelX = 3;
	private ballVelY = 3;
	private ballRadius = 7;

	constructor(canvasId: string, mode: string, left?: string, right?: string, socket?: any, room?: string) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.context = this.canvas.getContext('2d')!;
		this.socket = socket;
		if (mode === 'remote'){
			this.roomId = room;
		}

		this.initializeGameState(mode, left, right);
		this.setupSocketListeners();
		this.setupKeyboardListeners();
	}

	public joinRoom(gameId: string, username: string, nickname: string): void {
	    if (this.socket) {
	        this.socket.emit('joinGame', { gameId, username, nickname });
	        this.currentGameId = gameId;
	    }
	}
	
	private initializeGameState(_mode: string, left?: string, right?: string): void {
		this.game = {
			ballX: this.width / 2,
			ballY: this.height / 2,
			paddle2Y: this.height / 2 - 40,
			paddle1Y: this.height / 2 - 40,
			score_plr2: 0,
			score_plr1: 0,
			player2: left || 'Player 1',
			player1: right || 'Player 2',
			mode: _mode,
			timestamp: Date.now()
		};
	}
	
	private update(): void {
		const speed = 5;
		if (this.game.mode === 'remote') {
        	this.socket.emit('playerInput', {
        	    gameId: this.currentGameId,
        	    up: this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'],
        	    down: this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']
        	});
    	} else {
    		if (this.game.mode === 'local') {
        		if (this.keys['w'] || this.keys['W']) this.game.paddle2Y = Math.max(0, this.game.paddle2Y - speed);
        		if (this.keys['s'] || this.keys['S']) this.game.paddle2Y = Math.min(this.height - 80, this.game.paddle2Y + speed);
    		} else if (this.game.mode === 'bot') {
    		    const paddleCenter = this.game.paddle2Y + 40;
    		    if (this.game.ballX < this.width / 4) {
					if (paddleCenter < this.game.ballY - 20) {
						this.game.paddle2Y = Math.min(this.height - 80, this.game.paddle2Y + speed);
					} else if (paddleCenter > this.game.ballY + 20) {
						this.game.paddle2Y = Math.max(0, this.game.paddle2Y - speed);
					}
				}
			}
			if (this.game.mode === 'local' || this.game.mode === 'bot') {
				if (this.keys['ArrowUp']) {
					this.game.paddle1Y = Math.max(0, this.game.paddle1Y - speed);
				   }
				   if (this.keys['ArrowDown']) {
					   this.game.paddle1Y = Math.min(this.height - 80, this.game.paddle1Y + speed);
				   }
			}
   			if (this.game.mode === 'local' || this.game.mode === 'bot') {
   			    this.game.ballX += this.ballVelX;
   			    this.game.ballY += this.ballVelY;
   			    if (this.game.ballY - this.ballRadius <= 0 || this.game.ballY + this.ballRadius >= this.height) {
   			        this.ballVelY *= -1;
   			    }

    		    this.checkPaddleCollision();
   			    if (this.game.ballX - this.ballRadius <= 0) {
   			        this.game.score_plr1++;
   			        this.resetBall();
   			    }
   			    if (this.game.ballX + this.ballRadius >= this.width) {
   			        this.game.score_plr2++;
   			        this.resetBall();
   			    }
				if (this.game.score_plr1 >= 5 || this.game.score_plr2 >= 5) {
					this.isPaused = true;
				}
   			}
		}
	}

	private renderWinner(winner: string){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const ctx = this.context;
    	const midX = this.width / 2;
    	const midY = this.height / 2;

    	ctx.fillStyle = '#050805';
    	ctx.fillRect(0, 0, this.width, this.height);

    	ctx.textAlign = 'center';
    	ctx.fillStyle = '#1BFB08';
    	ctx.font = '50px VT323, monospace';
    	ctx.fillText("GAME OVER", midX, midY - 40);

    	ctx.fillRect(midX - 100, midY - 20, 200, 2);

    	ctx.font = '28px VT323, monospace';
    	ctx.fillText("CHAMPION", midX, midY + 30);
		
    	ctx.font = '40px VT323, monospace';
    	ctx.fillText(winner.toUpperCase(), midX, midY + 80);

    	ctx.fillStyle = 'rgba(5, 8, 5, 0.2)';
    	for (let i = 0; i < this.height; i += 4) {
    	    ctx.fillRect(0, i, this.width, 1);
    	}
	}

	private resetBall(): void {
		this.game.ballX = this.width / 2;
		this.game.ballY = this.height / 2;

		this.ballVelX = (Math.random() > 0.5 ? 1 : -1) * 4;
		this.ballVelY = (Math.random() > 0.5 ? 1 : -1) * 4;
	}

	private checkPaddleCollision(): void {
		const paddleWidth = 10;
		const paddleHeight = 80;

		if (
			this.game.ballX - this.ballRadius <= 10 + paddleWidth &&
			this.game.ballX - this.ballRadius >= 10 &&
			this.game.ballY >= this.game.paddle2Y &&
			this.game.ballY <= this.game.paddle2Y + paddleHeight
		) {
			this.ballVelX *= -1;
		}
		if (
			this.game.ballX + this.ballRadius >= this.width - 20 &&
			this.game.ballX + this.ballRadius <= this.width - 20 + paddleWidth &&
			this.game.ballY >= this.game.paddle1Y &&
			this.game.ballY <= this.game.paddle1Y + paddleHeight
		) {
			this.ballVelX *= -1;
		}
		
	}

	private setupKeyboardListeners(): void {
		window.addEventListener('keydown', (e) => {
			this.keys[e.key] = true;
		});
		
		window.addEventListener('keyup', (e) => {
			this.keys[e.key] = false;
		});
	}
	
	private setupSocketListeners(): void {
		if (!this.socket) return;

		this.socket.on('gameFull', () => {
		    alert('The game room is full. Cannot join the game.');
		});
		this.socket.on('gameState', (state: Partial<GameState>) => {
			this.game = {...this.game, ...state};
		});
		this.socket.on('gameOver', (winner: string) => {
			this.isPaused = true; 
			this.renderWinner(winner);
		});
		this.socket.on('gameNotFound', () => {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.fillStyle = 'rgba(0, 0, 0, 0.9)';
    	    this.context.fillRect(0, 0, this.width, this.height);

    	    this.context.fillStyle = '#1BFB08';
    	    this.context.font = 'bold 32px VT323, monospace';
    	    this.context.textAlign = 'center';
    	    this.context.fillText('ROOM NOT FOUND', this.width / 2, this.height / 2);
		
    	    this.context.font = '16px VT323, monospace';
    	    this.context.fillText('PLEASE CHECK THE CODE AND TRY AGAIN', this.width / 2, this.height / 2 + 40);
		
			this.roomId = '';
		});
		this.socket.on('gameStart', () => {
		    this.isStarted = true;
			requestAnimationFrame(() => this.loop());
		});
		this.socket.on('connect', () => {
			console.log('Connected to game server');
		});
		this.socket.on('playerDisconnected', (data: any) => {
			console.log('Disconnected from game server', data.playerId);
			this.isPaused = true;
			this.context.fillStyle = 'rgba(0, 0, 0, 0.85)';
		    this.context.fillRect(0, 0, this.width, this.height);

		    this.context.fillStyle = '#1BFB08';
		    this.context.font = '28px VT323, monospace';
		    this.context.textAlign = 'center';
		    this.context.fillText("OPPONENT DISCONNECTED", this.width / 2, this.height / 2 - 20);
		    this.context.fillText("YOU WIN BY DEFAULT!", this.width / 2, this.height / 2 + 30);
		});
		this.socket.on('error', (error: any) => {
			console.error('Socket error:', error);
			this.isPaused = true;
		});
	}
	
	private render(): void {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawCourt();
		this.drawPaddles();
		this.drawBall();
		this.drawScores();
		this.drawPlayerNames();
	}
	
	private drawPlayerNames(): void {
		const ctx = this.context;
		ctx.fillStyle = '#1BFB08';
		ctx.font = '24px VT323, monospace';
		ctx.textAlign = 'left';
		ctx.fillText(this.game.player2, 20, 45);
		ctx.textAlign = 'right';
		ctx.fillText(this.game.player1, this.width - 20, 45);
	}
	private drawScores(): void {
		const ctx = this.context;
		ctx.fillStyle = '#1BFB08';
		ctx.font = '32px VT323, monospace';
		ctx.textAlign = 'center';
		ctx.fillText(`${this.game.score_plr2}`, this.width / 2 - 80, 50);
		ctx.fillText(`${this.game.score_plr1}`, this.width / 2 + 80, 50);
	}
	
	private drawBall(): void {
		const ctx = this.context;
		ctx.fillStyle = '#1BFB08';
		ctx.beginPath();
		ctx.arc(this.game.ballX, this.game.ballY, 7, 0, Math.PI * 2);
		ctx.fill();
	}
	private drawCourt(): void {
		const ctx = this.context;
		ctx.fillStyle = '#050805';
		ctx.fillRect(0, 0, this.width, this.height);
		
		ctx.strokeStyle = '#1BFB08';
		ctx.lineWidth = 1;
		ctx.strokeRect(0, 0, this.width, this.height);
		
		ctx.strokeStyle = '#1BFB08';
		ctx.lineWidth = 1;
		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.moveTo(this.width / 2, 0);
		ctx.lineTo(this.width / 2, this.height);
		ctx.stroke();
		ctx.setLineDash([]);
	}

	private drawPaddles(): void {
		const paddleWidth = 10;
		const paddleHeight = 80;
		
		this.drawPaddle(10, this.game.paddle2Y, paddleWidth, paddleHeight);
		this.drawPaddle(this.width - 20, this.game.paddle1Y, paddleWidth, paddleHeight);
	}
	private drawPaddle(x: number, y: number, width: number, height: number): void {
		const ctx = this.context;
		ctx.fillStyle = '#1BFB08';
		ctx.fillRect(x, y, width, height);
	}
	private renderRoomId(room: string){
    	if (room === '' || !room) {
    	    return;
    	}
    	this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    	this.context.fillRect(0, 0, this.width, this.height);

    	this.context.fillStyle = '#1BFB08';
    	this.context.font = 'bold 24px VT323, monospace';
    	this.context.textAlign = 'center';
    	this.context.textBaseline = 'middle';

    	this.context.fillText('WAITING FOR OPPONENT...', this.width / 2, this.height / 2 - 40);
		
    	this.context.font = 'italic 32px VT323, monospace';
    	this.context.fillText(`ROOM ID: ${room}`, this.width / 2, this.height / 2 + 10);

    	this.context.font = '14px VT323, monospace';
    	this.context.fillText('SHARE THIS CODE TO START', this.width / 2, this.height / 2 + 60);
	}
	public loop(): void {
		if (this.isPaused) {
			if (this.game.score_plr1 >= 5) {
				this.renderWinner(this.game.player1)
			} else if(this.game.score_plr2 >= 5) {
				this.renderWinner(this.game.player2)
			}
			return;
		}
		if (this.game.mode === 'remote' && this.isStarted === false) {
			if (this.roomId){
				this.renderRoomId(this.roomId);
			}
	        requestAnimationFrame(() => this.loop());
        	return;
		} else {
			this.update();
			this.render();
			requestAnimationFrame(() => this.loop());
		}
	}
}
