const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Настройка статических файлов
app.use(express.static('public'));

// Обработка комнат и игр
const rooms = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'createRoom':
                handleCreateRoom(ws, data);
                break;
            case 'joinRoom':
                handleJoinRoom(ws, data);
                break;
            case 'action':
                handleGameAction(ws, data);
                break;
            case 'reset':
                handleResetGame(ws, data);
                break;
        }
    });

    ws.on('close', () => {
        // Очистка при отключении
        for (const [roomId, room] of rooms.entries()) {
            if (room.players.some(p => p.ws === ws)) {
                room.players = room.players.filter(p => p.ws !== ws);
                if (room.players.length === 0) {
                    rooms.delete(roomId);
                }
            }
        }
    });
});

function handleCreateRoom(ws, data) {
    const roomId = generateRoomId();
    const player = {
        id: 'player1',
        ws,
        name: data.playerName,
        balance: data.balance
    };

    rooms.set(roomId, {
        gameState: null,
        players: [player],
        waiting: true
    });

    ws.send(JSON.stringify({
        type: 'roomCreated',
        roomId,
        playerId: player.id
    }));
}

function handleJoinRoom(ws, data) {
    const room = rooms.get(data.roomId);
    if (!room) {
        return ws.send(JSON.stringify({ type: 'error', message: 'Комната не найдена' }));
    }

    if (room.players.length >= 2) {
        return ws.send(JSON.stringify({ type: 'error', message: 'Комната заполнена' }));
    }

    const player = {
        id: 'player2',
        ws,
        name: data.playerName,
        balance: data.balance
    };

    room.players.push(player);
    room.waiting = false;

    // Уведомляем обоих игроков
    broadcastToRoom(room, {
        type: 'gameStart',
        players: room.players.map(p => ({ id: p.id, name: p.name, balance: p.balance }))
    });

    // Начинаем игру
    startGame(room);
}

function handleGameAction(ws, data) {
    const room = findRoomByPlayer(ws);
    if (!room) return;

    // Обновляем состояние игры
    room.gameState = data.gameState;
    
    // Пересылаем обновление другому игроку
    const otherPlayer = room.players.find(p => p.ws !== ws);
    if (otherPlayer) {
        otherPlayer.ws.send(JSON.stringify({
            type: 'gameUpdate',
            gameState: data.gameState
        }));
    }
}

function handleResetGame(ws, data) {
    const room = findRoomByPlayer(ws);
    if (!room) return;

    startGame(room);
}

function startGame(room) {
    // Инициализация новой игры
    room.gameState = {
        players: [
            { id: 'player1', name: room.players[0].name, balance: room.players[0].balance },
            { id: 'player2', name: room.players[1].name, balance: room.players[1].balance }
        ],
        deck: generateDeck(),
        board: [],
        pot: 0,
        currentBet: 20,
        turn: 0,
        stage: "preflop",
        // ... остальная логика из вашего кода
    };

    broadcastToRoom(room, {
        type: 'gameUpdate',
        gameState: room.gameState
    });
}

// Вспомогательные функции
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return ranks.flatMap(rank => suits.map(suit => ({ rank, suit })));
}

function broadcastToRoom(room, message) {
    room.players.forEach(player => {
        player.ws.send(JSON.stringify(message));
    });
}

function findRoomByPlayer(ws) {
    for (const room of rooms.values()) {
        if (room.players.some(p => p.ws === ws)) {
            return room;
        }
    }
    return null;
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});