// credits -> Kenny Yip Coding - https://www.youtube.com/watch?v=jj5ADM2uywg&t=2042s

// board - dimensões = 360x640
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// passarinho - dimensões = 408x228 -> razão 17x12
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

// define as dimensões do passarinho
let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

// define as dimensões dos pipes - dimensões = 384x30272-> razão 1x8
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2; // velocidade negativa porque os pipes vão da direita para a esquerda
let velocityY = 0; // velocidade do pulo do passarinho
let gravity = 0.4; // gravidade, para que o pulo não suba o passarinho infinitamente

let gameOver = false;
let score = 0;

window.onload = function () {
    // desenha na tag canvas, sobre a imagem
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext('2d');

    // carrega a imagem do passarinho
    birdImg = new Image();
    birdImg.src = './flappybird.png';
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, birdWidth, birdHeight);
    }
    
    topPipeImg = new Image();
    topPipeImg.src = './toppipe.png';
    
    bottomPipeImg = new Image();
    bottomPipeImg.src = './bottompipe.png';

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // atualiza os pipes a cada 1500ms
    document.addEventListener('keydown', moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }

    // redesenha o board e apaga o que foi desenhado anteriormente
    context.clearRect(0, 0, board.width, board.height);

    // redesenha o bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // aplica a gravidade no passarinho e assegura-se que ele não ultrapasse o limite do canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // redesenha o pipe
    for (let i=0; i<pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX; // anda 2 pixels para a esquerda no eixo x, devido à velocidade negativa
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 0.5 porque há dois canos (0.5+0.5 = 1)
            pipe.passed = true;
        } 

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // remove os elementos que já saíram do canvas, para uma gestão de memória melhor
    }

    context.fillStyle = 'white';
    context.font = '45px sans-serif';
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText('GAME OVER', 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2); // faz a height do pipe variar entre -0,25 e -0,75 da sua height total
    let openingSpace = board.height/4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);
    
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird (e) {
    if (e.code == 'Space' || e.code == 'ArrowUp' || e.code == 'KeyX') { // define as teclas de pulo do passarinho
        velocityY = -6;
        
        if (gameOver) { // reinicia o jogo após pressionar as teclas de pulo
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision (a, b) {
    return a.x < b.x + b.width &&   // canto superior esquerdo de 'a' não passe o canto superior direito de 'b'
           a.x + a.width > b.x &&   // canto superior direito de 'a' passe o canto superior esquerdo de 'b'
           a.y < b.y + b.height &&  // canto superior esquerdo de 'a' não passe o canto inferior esquerdo de 'b'
           a.y + a.height > b.y;    // canto inferior esquerdo de 'a' não passe do canto superior esquerdo de 'b'
}