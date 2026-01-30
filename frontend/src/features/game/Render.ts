
interface GameState {
	ballX: number;
	ballY: number;
	paddleLeftY: number;
	paddleRightY: number;
	scoreLeft: number;
	scoreRight: number;
	mode: string;
	playerLeft: string;
	playerRight: string;
	timestamp: number;
}

export class PongGame {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;

	private width = 800;
	private height = 500;

	private game!: GameState;
	private socket: any;
	private keys: { [key: string]: boolean } = {};

	private ballVelX = 4;
	private ballVelY = 4;
	private ballRadius = 7;

	constructor(canvasId: string, mode?: string, left?: string, right?: string, socket?: any) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.context = this.canvas.getContext('2d')!;
		this.socket = socket;
		this.initializeGameState(mode, left, right);
		this.setupKeyboardListeners();
		this.setupSocketListeners();
	}

	private initializeGameState(mode?: string, left?: string, right?: string): void {
		this.game = {
			ballX: this.width / 2,
			ballY: this.height / 2,
			paddleLeftY: this.height / 2 - 40,
			paddleRightY: this.height / 2 - 40,
			scoreLeft: 0,
			scoreRight: 0,
			mode: mode || 'local',
			playerLeft: left || 'Player 1',
			playerRight: right || 'Player 2',
			timestamp: Date.now()
		};
	}

	private update(): void {
		if (this.game.mode === 'local') {
			if (this.keys['w'] || this.keys['W']) {
				this.game.paddleLeftY = Math.max(0, this.game.paddleLeftY - 7);
			}
			if (this.keys['s'] || this.keys['S']) {
				this.game.paddleLeftY = Math.min(this.height - 80, this.game.paddleLeftY + 7);
			}
		}
		if (this.keys['ArrowUp']) {
			this.game.paddleRightY = Math.max(0, this.game.paddleRightY - 7);
		}
		if (this.keys['ArrowDown']) {
			this.game.paddleRightY = Math.min(this.height - 80, this.game.paddleRightY + 7);
		}
		if (this.game.mode === 'local') {
			this.game.ballX += this.ballVelX;
			this.game.ballY += this.ballVelY;

			if (this.game.ballY - this.ballRadius <= 0 || this.game.ballY + this.ballRadius >= this.height) {
				this.ballVelY *= -1;
			}
			this.checkPaddleCollision();
			if (this.game.ballX - this.ballRadius <= 0) {
				this.game.scoreRight++;
				this.resetBall();
			}
			if (this.game.ballX + this.ballRadius >= this.width) {
				this.game.scoreLeft++;
				this.resetBall();
			}
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
			this.game.ballY >= this.game.paddleLeftY &&
			this.game.ballY <= this.game.paddleLeftY + paddleHeight
		) {
			this.ballVelX *= -1;
		}
		if (
			this.game.ballX + this.ballRadius >= this.width - 20 &&
			this.game.ballX + this.ballRadius <= this.width - 20 + paddleWidth &&
			this.game.ballY >= this.game.paddleRightY &&
			this.game.ballY <= this.game.paddleRightY + paddleHeight
		) {
			this.ballVelX *= -1;
		} else {
			this.sendPaddleInput();
		}
	}
	private sendPaddleInput(): void {
		if (!this.socket) return;
		
		this.socket.emit('paddleMove', {
			paddleY: this.game.paddleRightY
		});
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
		this.socket.on('gameState', (state: Partial<GameState>) => {
			this.game = { ...this.game, ...state };
		});
		this.socket.on('connect', () => {
			console.log('Connected to game server');
		});
		this.socket.on('disconnect', () => {
			console.log('Disconnected from game server');
		});
		this.socket.on('error', (error: any) => {
			console.error('Socket error:', error);
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
		ctx.fillText(this.game.playerLeft, 20, 45);
		ctx.textAlign = 'right';
		ctx.fillText(this.game.playerRight, this.width - 20, 45);
	}
	private drawScores(): void {
		const ctx = this.context;
		ctx.fillStyle = '#1BFB08';
		ctx.font = '32px VT323, monospace';
		ctx.textAlign = 'center';
		ctx.fillText(`${this.game.scoreLeft}`, this.width / 2 - 80, 50);
		ctx.fillText(`${this.game.scoreRight}`, this.width / 2 + 80, 50);
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

		this.drawPaddle(10, this.game.paddleLeftY, paddleWidth, paddleHeight);
		this.drawPaddle(this.width - 20, this.game.paddleRightY, paddleWidth, paddleHeight);
	}
	private drawPaddle(x: number, y: number, width: number, height: number): void {
		const ctx = this.context;
		ctx.fillStyle = '#1BFB08';
		ctx.fillRect(x, y, width, height);
	}

	public loop(): void {
		this.update();
		this.render();
		requestAnimationFrame(() => this.loop());
	}
}