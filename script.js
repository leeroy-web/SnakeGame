class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 游戏状态
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // 蛇的初始状态
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.dx = 0;
        this.dy = 0;
        
        // 食物位置
        this.food = {
            x: 15,
            y: 15
        };
        
        // 分数
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        
        // 游戏速度
        this.baseGameSpeed = 150;
        this.gameSpeed = this.baseGameSpeed;
        
        this.initializeGame();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeGame() {
        this.drawGame();
    }
    
    changeDirection(newDx, newDy) {
        if (!this.gameRunning || this.gamePaused) return;
        
        // 防止反向移动
        if (newDx !== 0 && this.dx !== -newDx) {
            this.dx = newDx;
            this.dy = 0;
        } else if (newDy !== 0 && this.dy !== -newDy) {
            this.dx = 0;
            this.dy = newDy;
        }
    }
    
    bindEvents() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.changeDirection(0, -1);
                    break;
                case 'ArrowDown':
                    this.changeDirection(0, 1);
                    break;
                case 'ArrowLeft':
                    this.changeDirection(-1, 0);
                    break;
                case 'ArrowRight':
                    this.changeDirection(1, 0);
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        // 速度控制事件
        document.getElementById('speedSelect').addEventListener('change', (e) => {
            this.baseGameSpeed = parseInt(e.target.value);
            this.gameSpeed = this.baseGameSpeed;
        });
        
        // 虚拟键盘事件 - 同时支持点击和触摸
        const addButtonEvents = (id, dx, dy) => {
            const btn = document.getElementById(id);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeDirection(dx, dy);
            });
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.changeDirection(dx, dy);
            });
        };
        
        addButtonEvents('upBtn', 0, -1);
        addButtonEvents('downBtn', 0, 1);
        addButtonEvents('leftBtn', -1, 0);
        addButtonEvents('rightBtn', 1, 0);
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        
        // 设置初始方向
        this.dx = 1;
        this.dy = 0;
        
        this.updateButtons();
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning || this.gameOver) return;
        
        this.gamePaused = !this.gamePaused;
        this.updateButtons();
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        // 重置蛇的位置
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.dx = 0;
        this.dy = 0;
        
        // 重置分数
        this.score = 0;
        
        // 重置游戏速度
        this.gameSpeed = this.baseGameSpeed;
        
        // 重新生成食物
        this.generateFood();
        
        // 隐藏游戏结束界面
        document.getElementById('gameOver').classList.remove('show');
        
        this.updateDisplay();
        this.updateButtons();
        this.drawGame();
    }
    
    restartGame() {
        this.resetGame();
        this.startGame();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        setTimeout(() => {
            this.update();
            this.draw();
            this.gameLoop();
        }, this.gameSpeed);
    }
    
    update() {
        // 移动蛇头
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // 检查自身碰撞
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.endGame();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            this.updateDisplay();
            
            // 增加游戏速度（基于基础速度的80%作为最快速度）
            const minSpeed = Math.max(this.baseGameSpeed * 0.5, 50);
            if (this.gameSpeed > minSpeed) {
                this.gameSpeed -= Math.max(1, this.baseGameSpeed * 0.02);
            }
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        this.drawGame();
    }
    
    drawGame() {
        // 清空画布
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制蛇
        this.drawSnake();
        
        // 绘制食物
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#48bb78';
                this.ctx.fillRect(segment.x * this.gridSize + 1, segment.y * this.gridSize + 1, 
                                this.gridSize - 2, this.gridSize - 2);
                
                // 蛇头的眼睛
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + 5, 3, 3);
                this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 5, 3, 3);
            } else {
                // 蛇身
                this.ctx.fillStyle = '#68d391';
                this.ctx.fillRect(segment.x * this.gridSize + 2, segment.y * this.gridSize + 2, 
                                this.gridSize - 4, this.gridSize - 4);
            }
        });
    }
    
    drawFood() {
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // 食物的高光
        this.ctx.fillStyle = '#fc8181';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2 - 3,
            this.food.y * this.gridSize + this.gridSize / 2 - 3,
            3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        // 显示游戏结束界面
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.add('show');
        
        this.updateDisplay();
        this.updateButtons();
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    updateButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (this.gameRunning && !this.gameOver) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            pauseBtn.textContent = '暂停';
        }
        
        resetBtn.disabled = false;
    }
}

// 初始化游戏
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new SnakeGame();
});

// 防止方向键滚动页面
document.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

// 移动端触摸控制
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!game || !game.gameRunning || game.gamePaused) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0 && game.dx !== -1) {
                // 向右滑动
                game.dx = 1;
                game.dy = 0;
            } else if (deltaX < 0 && game.dx !== 1) {
                // 向左滑动
                game.dx = -1;
                game.dy = 0;
            }
        }
    } else {
        // 垂直滑动
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0 && game.dy !== -1) {
                // 向下滑动
                game.dx = 0;
                game.dy = 1;
            } else if (deltaY < 0 && game.dy !== 1) {
                // 向上滑动
                game.dx = 0;
                game.dy = -1;
            }
        }
    }
});