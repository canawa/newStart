const crypto = require('crypto');
const os = require('os')
const fs = require('fs');
const socketIo = require('socket.io');

let speed = 70
let gameHistory = [0, 1, 2, 3, 4, 5]
let gameInState = 0
let GameInterval
let gameLoopTimeout

const express = require('express')
const http = require('http')
const app = express()
const { Server } = require('socket.io')

app.set('view engine', 'ejs')
app.use(express.static('public')) // тут статические файлы
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/crash', (req, res) => {
    res.render('crash', {
       // тут объект, который передает данные в шаблонизатор
    })
})

app.get('/mines', (req, res) => {
    res.render('mines')
})

app.get('/profile/', (req, res) => {
    res.render('profile')
})

const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    console.log('Новый клиент подключен!')
   
    socket.on('crash', (data)=>{
        if (gameInState === 10){
        console.log('ПРИНЯТО, КОЭФИЦИЕНТ ИЗМЕНЕН!')
        gameResult = i }
    })
  
})


server.listen(3000, () => {
    console.log('Server Running!')
})


















// const http = require('http')
// let server = http.createServer((req,res)=> {
//     res.writeHead(200,{'Content-Type':  'text/html; charset = utf-8',})
//     if (req.url == '/') {
//         fs.createReadStream('./pages/index.html').pipe(res)
//     } else if (req.url == '/crash') {
//         fs.createReadStream('./pages/crash.html').pipe(res)
//     } else if (req.url == '/mines') {
//         fs.createReadStream('./pages/mines.html').pipe(res)
//     } else {fs.createReadStream('./pages/error.html').pipe(res)}
// })

// const PORT = 3000
// const HOST = 'localhost'

// server.listen(PORT, HOST, ()=>{console.log(`Сервер запущен : http://${HOST}:${PORT}`)})

const { createClient } = require('@supabase/supabase-js');
const { Socket } = require('dgram');
const { clearInterval } = require('timers');
const { emit } = require('process');
const supabaseUrl = 'https://viyfblkecqgwdnczljlq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeWZibGtlY3Fnd2RuY3psamxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NDIwMjYsImV4cCI6MjA1NjUxODAyNn0.Flmtd3YQaj7yVLPVD3cVpg5HVRVhD-tmZL7Cd-_3Mho'
const supabase = createClient(supabaseUrl, supabaseKey)

let i = 1

let gameResult = 0

let res = os.platform()
console.log(res)


async function crashButton() {
    gameResult = i + 0.1
}

function coefficient() {
    const randomValue = crypto.randomInt(0, 2 ** 32)
    gameResult = 1 / (randomValue / 2 ** 32 * 0.93);
    gameResult = parseFloat(gameResult.toFixed(2))
    if (crypto.randomInt(0, 100) <= 4) {
        gameResult = 1.0
    }
    sendDataToSupabase(gameResult)

    return gameResult
}

async function sendDataToSupabase(gameResult) {

    const { data, error } = await supabase
        .from('CrashGameHistory')
        .insert([
            {
                Coefficient: gameResult,
                Time: new Date(),
            }
        ])

    if (error) {
        console.error('Ошибка при отправке данных в Supabase:', error)
    } else {
        console.log('Данные успешно отправлены:')
    }
}


const startGame = () => {
    
    if (gameInState === 0) {
        let countdown = 10;
        gameInState = 10;
        coefficient();
        let speed = 50;
        i = 1.0;

        
        const gameLoop = () => {
            console.log(gameResult.toFixed(2));
            if (i < 2) {
                
                speed = 50; 
                add = 0.01;
                
            } else if (i < 5) {
               
                speed = 40; 
                add = 0.01;
                
            } else if (i < 10) {
             
                speed = 30; 
                add = 0.03;
                
            } else if (i < 20) {
            
                speed = 30; 
                add = 0.06;
                
            } else if (i < 50) {
               
                speed = 20; 
                add = 0.09;
                
            } else if ( i < 200 ) {
                speed = 1; 
                add = 0.19
               
            } else if ( i > 200 ) {
                speed = 1
                add = 1.89
            } else if (i > 1000) {
                speed = 1
                add = 3.89
            } else if (i > 3000) {
                speed = 1
                add = 198.33
            }
            
         

            if (i < gameResult) {
                i += add;
                io.emit('gameUpdate', {
                    CurrentCoefficient: `${i.toFixed(2)}x`,
                });

               


                // Запускаем следующую итерацию
                gameLoopTimeout = setTimeout(gameLoop, speed);
            } else {
                // Логика завершения игры
                const iCopy = i;
                i = 1.0;
                gameInState = 0;
                gameHistory.unshift(gameResult);

                // Таймер отображения результата
                const crashResult = setInterval(() => {
                    io.emit('gameUpdate', {
                        CurrentCoefficient: `Crashed at: ${gameResult.toFixed(2)}x!`,
                        Countdown: `Next game in ${countdown} seconds`,
                    });
                }, 1);

                // Обратный отсчет
                const countdownInterval = setInterval(() => {
                    countdown -= 1;
                    if (countdown <= 0) {
                        clearInterval(countdownInterval);
                        clearInterval(crashResult);
                        io.emit('gameUpdate', { Countdown: 'Game is in progress!' });
                        startGame(); // Новая игра
                    }
                }, 1000);
            }
        };

        // Запуск игрового цикла
        gameLoopTimeout = setTimeout(gameLoop, speed);
    }
};

startGame();
setInterval(() => {
    io.emit('gameHistory', {
        gameHistory0: gameHistory[0],
        gameHistory1: gameHistory[1],
        gameHistory2: gameHistory[2],
        gameHistory3: gameHistory[3],
        gameHistory4: gameHistory[4],
        gameHistory5: gameHistory[5],
    })

}, 1);




