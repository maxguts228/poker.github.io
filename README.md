<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Poker WebApp</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'poker-green': '#0F5132',
                        'poker-felt': '#1B5E20',
                        'primary': '#5D5CDE',
                    }
                }
            },
            darkMode: 'class'
        }
    </script>
    <style>
        .card {
            aspect-ratio: 2.5/3.5;
            background: linear-gradient(145deg, #ffffff, #f0f0f0);
            border: 2px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card-back {
            background: linear-gradient(45deg, #1e40af, #3b82f6);
            border: 2px solid #1d4ed8;
        }
        .poker-table {
            background: radial-gradient(ellipse at center, #2d5a3d 0%, #1B5E20 70%);
            border: 8px solid #8B4513;
        }
        .chip {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            color: white;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        }
        .chip-10 { background: #ff4444; }
        .chip-20 { background: #4444ff; }
        .chip-50 { background: #44ff44; }
        .chip-100 { background: #ffff44; color: #333; }
        .animate-deal {
            animation: dealCard 0.5s ease-in-out;
        }
        @keyframes dealCard {
            0% { transform: translateY(-100px) rotate(180deg); opacity: 0; }
            100% { transform: translateY(0) rotate(0deg); opacity: 1; }
        }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <!-- Dark mode support -->
    <script>
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    </script>
    <div class="container mx-auto px-4 py-4 max-w-6xl">
        <!-- Header -->
        <div class="text-center mb-6">
            <h1 class="text-4xl font-bold text-primary mb-2">🃏 Poker WebApp</h1>
            <p class="text-gray-400">Техасский холдем для двух игроков</p>
        </div>
        <!-- Game Setup -->
        <div id="setupScreen" class="text-center py-8">
            <div class="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
                <h2 class="text-2xl font-bold mb-6">Настройка игры</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Имя игрока 1:</label>
                        <input type="text" id="player1Name" value="Игрок 1" 
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Имя игрока 2:</label>
                        <input type="text" id="player2Name" value="Игрок 2" 
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Начальный банк:</label>
                        <input type="number" id="startBalance" value="1000" min="100" 
                               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                </div>
                <button onclick="startGame()" 
                        class="mt-6 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Начать игру
                </button>
            </div>
        </div>
        <!-- Game Screen -->
        <div id="gameScreen" class="hidden">
            <!-- Opponent (Player 2) -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span id="player2Avatar" class="text-sm font-bold">P2</span>
                        </div>
                        <div>
                            <div id="player2Name" class="font-semibold">Игрок 2</div>
                            <div id="player2Balance" class="text-sm text-gray-400">$1000</div>
                        </div>
                    </div>
                    <div id="player2Bet" class="text-lg font-bold text-yellow-400"></div>
                </div>
                <div class="flex justify-center space-x-2">
                    <div id="player2Card1" class="card card-back w-16"></div>
                    <div id="player2Card2" class="card card-back w-16"></div>
                </div>
            </div>
            <!-- Poker Table -->
            <div class="poker-table rounded-full p-8 mb-6 relative">
                <!-- Pot -->
                <div class="text-center mb-4">
                    <div class="text-sm text-gray-300 mb-1">Банк</div>
                    <div id="potAmount" class="text-2xl font-bold text-yellow-400">$0</div>
                </div>
                <!-- Community Cards -->
                <div class="flex justify-center space-x-3 mb-4">
                    <div id="flop1" class="card w-20 hidden"></div>
                    <div id="flop2" class="card w-20 hidden"></div>
                    <div id="flop3" class="card w-20 hidden"></div>
                    <div id="turn" class="card w-20 hidden"></div>
                    <div id="river" class="card w-20 hidden"></div>
                </div>
                <!-- Game Info -->
                <div class="text-center">
                    <div id="gameStage" class="text-lg font-semibold text-yellow-300 mb-2">Preflop</div>
                    <div id="currentPlayer" class="text-sm text-gray-300">Ход: Игрок 1</div>
                    <div id="currentBet" class="text-sm text-gray-400">Текущая ставка: $0</div>
                </div>
            </div>
            <!-- Player 1 (Current Player) -->
            <div class="mb-6">
                <div class="flex justify-center space-x-2 mb-3">
                    <div id="player1Card1" class="card w-20"></div>
                    <div id="player1Card2" class="card w-20"></div>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <span id="player1Avatar" class="text-sm font-bold">P1</span>
                        </div>
                        <div>
                            <div id="player1Name" class="font-semibold">Игрок 1</div>
                            <div id="player1Balance" class="text-sm text-gray-400">$1000</div>
                        </div>
                    </div>
                    <div id="player1Bet" class="text-lg font-bold text-yellow-400"></div>
                </div>
            </div>
            <!-- Action Buttons -->
            <div id="actionButtons" class="grid grid-cols-2 gap-3 mb-6">
                <button id="foldBtn" onclick="playerAction('fold')" 
                        class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Сброс
                </button>
                <button id="checkCallBtn" onclick="playerAction('check')" 
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Чек
                </button>
                <button id="bet20Btn" onclick="playerAction('bet', 20)" 
                        class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Бет $20
                </button>
                <button id="bet50Btn" onclick="playerAction('bet', 50)" 
                        class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Бет $50
                </button>
                <button id="bet100Btn" onclick="playerAction('bet', 100)" 
                        class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm">
                    Бет $100
                </button>
                <button id="showBtn" onclick="playerAction('show')" 
                        class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors hidden">
                    Открыть
                </button>
            </div>
            <!-- Game Log -->
            <div class="bg-gray-800 rounded-lg p-4 max-h-32 overflow-y-auto">
                <div class="text-sm text-gray-400 mb-2">Лог игры:</div>
                <div id="gameLog" class="text-sm space-y-1"></div>
            </div>
            <!-- Reset Button -->
            <div class="text-center mt-6">
                <button onclick="resetGame()" 
                        class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    Новая игра
                </button>
            </div>
        </div>
    </div>
    <!-- Modal for winner announcement -->
    <div id="winnerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4">
            <h2 class="text-2xl font-bold mb-4 text-center">🎉 Результат</h2>
            <div id="winnerText" class="text-center mb-6"></div>
            <div class="flex justify-center space-x-3">
                <button onclick="closeWinnerModal()" 
                        class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Закрыть
                </button>
                <button onclick="closeWinnerModal(); resetGame()" 
                        class="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded">
                    Новая игра
                </button>
            </div>
        </div>
    </div>
    <script>
        // Константы
        const SUITS = ['♠', '♥', '♦', '♣'];
        const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const RANKS_VALUES = Object.fromEntries(RANKS.map((r, i) => [r, i + 2]));
        const SMALL_BLIND = 10;
        const BIG_BLIND = 20;
        // Состояние игры
        let game = {
            players: [],
            deck: [],
            board: [],
            pot: 0,
            currentBet: 0,
            turn: 0,
            stage: "waiting",
            lastRaiser: 1,
            smallBlindPos: 0
        };
        // Класс игрока
        class Player {
            constructor(name, balance) {
                this.name = name;
                this.hand = [];
                this.balance = balance;
                this.currentBet = 0;
                this.folded = false;
            }
        }
        // Генерация колоды
        function getDeck() {
            return RANKS.flatMap(rank => 
                SUITS.map(suit => ({ rank, suit }))
            );
        }
        // Перемешивание массива
        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        // Форматирование карт для отображения
        function formatCard(card) {
            const color = (card.suit === '♥' || card.suit === '♦') ? 'text-red-500' : 'text-black';
            return `<div class="flex flex-col items-center justify-center h-full ${color}">
                        <div class="text-lg font-bold">${card.rank}</div>
                        <div class="text-xl">${card.suit}</div>
                    </div>`;
        }
        // Отображение карты в элементе
        function displayCard(elementId, card, hidden = false) {
            const element = document.getElementById(elementId);
            if (hidden) {
                element.className = 'card card-back w-16';
                element.innerHTML = '';
            } else {
                element.className = 'card w-16';
                element.innerHTML = formatCard(card);
            }
        }
        // Определение силы руки
        function handRank(cards) {
            const ranks = cards.map(c => RANKS.indexOf(c.rank)).sort((a, b) => b - a);
            const suits = cards.map(c => c.suit);
            const counts = {};
            ranks.forEach(rank => counts[rank] = (counts[rank] || 0) + 1);
            const isFlush = suits.some(suit => suits.filter(s => s === suit).length >= 5);
            const straight = findStraight(ranks);
            const countsArray = Object.entries(counts)
                .map(([rank, count]) => [parseInt(rank), count])
                .sort((a, b) => b[1] - a[1] || b[0] - a[0]);
            // Проверка комбинаций (упрощенная версия)
            if (countsArray[0][1] === 4) return [7, countsArray[0][0]]; // Каре
            if (countsArray[0][1] === 3 && countsArray[1][1] >= 2) return [6, countsArray[0][0]]; // Фулл хаус
            if (isFlush) return [5, Math.max(...ranks)]; // Флеш
            if (straight) return [4, straight]; // Стрит
            if (countsArray[0][1] === 3) return [3, countsArray[0][0]]; // Тройка
            if (countsArray[0][1] === 2 && countsArray[1][1] === 2) return [2, Math.max(countsArray[0][0], countsArray[1][0])]; // Две пары
            if (countsArray[0][1] === 2) return [1, countsArray[0][0]]; // Пара
            return [0, Math.max(...ranks)]; // Старшая карта
        }
        function findStraight(ranks) {
            const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
            for (let i = 0; i <= uniqueRanks.length - 5; i++) {
                if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
                    return uniqueRanks[i];
                }
            }
            // Проверка на A-2-3-4-5
            if (uniqueRanks.includes(12) && uniqueRanks.includes(0) && uniqueRanks.includes(1) && uniqueRanks.includes(2) && uniqueRanks.includes(3)) {
                return 3;
            }
            return null;
        }
        // Сравнение рук
        function compareHands(hand1, hand2) {
            const rank1 = handRank(hand1);
            const rank2 = handRank(hand2);
            if (rank1[0] > rank2[0]) return 1;
            if (rank1[0] < rank2[0]) return -1;
            if (rank1[1] > rank2[1]) return 1;
            if (rank1[1] < rank2[1]) return -1;
            return 0;
        }
        // Начало игры
        function startGame() {
            const player1Name = document.getElementById('player1Name').value || 'Игрок 1';
            const player2Name = document.getElementById('player2Name').value || 'Игрок 2';
            const startBalance = parseInt(document.getElementById('startBalance').value) || 1000;
            game.players = [
                new Player(player1Name, startBalance),
                new Player(player2Name, startBalance)
            ];
            document.getElementById('setupScreen').classList.add('hidden');
            document.getElementById('gameScreen').classList.remove('hidden');
            updatePlayerNames();
            dealNewHand();
        }
        // Обновление имен игроков в интерфейсе
        function updatePlayerNames() {
            document.getElementById('player1Name').textContent = game.players[0].name;
            document.getElementById('player2Name').textContent = game.players[1].name;
            document.getElementById('player1Avatar').textContent = game.players[0].name[0].toUpperCase();
            document.getElementById('player2Avatar').textContent = game.players[1].name[0].toUpperCase();
        }
        // Раздача новой руки
        function dealNewHand() {
            // Сброс состояния
            game.deck = shuffle(getDeck());
            game.board = [];
            game.pot = 0;
            game.currentBet = BIG_BLIND;
            game.stage = "preflop";
            game.players.forEach(player => {
                player.hand = [];
                player.currentBet = 0;
                player.folded = false;
            });
            // Определение позиций
            game.smallBlindPos = Math.random() < 0.5 ? 0 : 1;
            const bbPos = 1 - game.smallBlindPos;
            // Слепые ставки
            game.players[game.smallBlindPos].balance -= SMALL_BLIND;
            game.players[game.smallBlindPos].currentBet = SMALL_BLIND;
            game.players[bbPos].balance -= BIG_BLIND;
            game.players[bbPos].currentBet = BIG_BLIND;
            game.pot = SMALL_BLIND + BIG_BLIND;
            // Раздача карт
            for (let i = 0; i < 2; i++) {
                game.players[0].hand.push(game.deck.pop());
                game.players[1].hand.push(game.deck.pop());
            }
            game.turn = game.smallBlindPos;
            game.lastRaiser = bbPos;
            addToLog("Новая рука! Слепые ставки размещены.");
            updateUI();
        }
        // Действие игрока
        function playerAction(action, amount = 0) {
            const player = game.players[game.turn];
            switch(action) {
                case 'fold':
                    player.folded = true;
                    addToLog(`${player.name} сбросил карты`);
                    const winner = game.players.find(p => !p.folded);
                    if (winner) {
                        winner.balance += game.pot;
                        showWinner(`${winner.name} выиграл банк $${game.pot}!`);
                        return;
                    }
                    break;
                case 'check':
                    addToLog(`${player.name} чек`);
                    nextTurn();
                    break;
                case 'call':
                    const toCall = game.currentBet - player.currentBet;
                    const callAmount = Math.min(toCall, player.balance);
                    player.balance -= callAmount;
                    player.currentBet += callAmount;
                    game.pot += callAmount;
                    addToLog(`${player.name} колл $${callAmount}`);
                    nextTurn();
                    break;
                case 'bet':
                    const toCal = game.currentBet - player.currentBet;
                    const totalBet = toCal + amount;
                    if (totalBet > player.balance) {
                        addToLog("Недостаточно фишек!");
                        return;
                    }
                    player.balance -= totalBet;
                    player.currentBet += totalBet;
                    game.currentBet = player.currentBet;
                    game.pot += totalBet;
                    game.lastRaiser = game.turn;
                    addToLog(`${player.name} бет $${totalBet}`);
                    nextTurn();
                    break;
                case 'show':
                    revealCards();
                    return;
            }
            updateUI();
        }
        // Следующий ход
        function nextTurn() {
            game.turn = 1 - game.turn;
            if (isRoundOver()) {
                nextStage();
            }
        }
        // Проверка окончания раунда
        function isRoundOver() {
            const activePlayers = game.players.filter(p => !p.folded);
            if (activePlayers.length === 1) return true;
            const bets = activePlayers.map(p => p.currentBet);
            return bets.every(bet => bet === game.currentBet);
        }
        // Следующая стадия
        function nextStage() {
            game.players.forEach(p => p.currentBet = 0);
            game.currentBet = 0;
            game.turn = game.smallBlindPos;
            switch(game.stage) {
                case "preflop":
                   // Флоп
                    for (let i = 0; i < 3; i++) {
                        game.board.push(game.deck.pop());
                    }
                    game.stage = "flop";
                    addToLog("Флоп открыт!");
                    break;
                case "flop":
                    // Терн
                    game.board.push(game.deck.pop());
                    game.stage = "turn";
                    addToLog("Терн открыт!");
                    break;
                case "turn":
                    // Ривер
                    game.board.push(game.deck.pop());
                    game.stage = "river";
                    addToLog("Ривер открыт!");
                    break;
                case "river":
                    revealCards();
                    return;
            }
            updateUI();
        }
        // Вскрытие карт
        function revealCards() {
            game.stage = "showdown";
            const hands = [
                [...game.players[0].hand, ...game.board],
                [...game.players[1].hand, ...game.board]
            ];
            const comparison = compareHands(hands[0], hands[1]);
            let winner, message;
            if (comparison === 1) {
                winner = game.players[0];
                message = `${winner.name} выиграл!`;
            } else if (comparison === -1) {
                winner = game.players[1];
                message = `${winner.name} выиграл!`;
            } else {
                message = "Ничья! Банк делится поровну.";
                game.players[0].balance += Math.floor(game.pot / 2);
                game.players[1].balance += Math.ceil(game.pot / 2);
                updateUI();
                showWinner(message);
                return;
            }
            winner.balance += game.pot;
            updateUI();
            showWinner(`${message} Выигрыш: $${game.pot}`);
        }
        // Обновление интерфейса
        function updateUI() {
            // Обновление балансов
            document.getElementById('player1Balance').textContent = `$${game.players[0].balance}`;
            document.getElementById('player2Balance').textContent = `$${game.players[1].balance}`;
            // Обновление ставок
            document.getElementById('player1Bet').textContent = game.players[0].currentBet > 0 ? `$${game.players[0].currentBet}` : '';
            document.getElementById('player2Bet').textContent = game.players[1].currentBet > 0 ? `$${game.players[1].currentBet}` : '';
            // Обновление банка
            document.getElementById('potAmount').textContent = `$${game.pot}`;
            // Обновление стадии
            document.getElementById('gameStage').textContent = game.stage.charAt(0).toUpperCase() + game.stage.slice(1);
            document.getElementById('currentPlayer').textContent = `Ход: ${game.players[game.turn].name}`;
            document.getElementById('currentBet').textContent = `Текущая ставка: $${game.currentBet}`;
            // Отображение карт игроков
            if (game.players[0].hand.length > 0) {
                displayCard('player1Card1', game.players[0].hand[0]);
                displayCard('player1Card2', game.players[0].hand[1]);
            }
            if (game.stage === "showdown") {
                displayCard('player2Card1', game.players[1].hand[0]);
                displayCard('player2Card2', game.players[1].hand[1]);
            } else {
                displayCard('player2Card1', null, true);
                displayCard('player2Card2', null, true);
            }
            // Отображение общих карт
            updateCommunityCards();
            // Обновление кнопок действий
            updateActionButtons();
        }
        // Обновление общих карт
        function updateCommunityCards() {
            const cardElements = ['flop1', 'flop2', 'flop3', 'turn', 'river'];
            cardElements.forEach((elementId, index) => {
                const element = document.getElementById(elementId);
                if (game.board[index]) {
                    element.classList.remove('hidden');
                    element.innerHTML = formatCard(game.board[index]);
                } else {
                    element.classList.add('hidden');
                }
            });
        }
        // Обновление кнопок действий
        function updateActionButtons() {
            const player = game.players[game.turn];
            const toCall = game.currentBet - player.currentBet;
            // Кнопка Check/Call
            const checkCallBtn = document.getElementById('checkCallBtn');
            if (toCall > 0) {
                checkCallBtn.textContent = `Колл $${Math.min(toCall, player.balance)}`;
                checkCallBtn.onclick = () => playerAction('call');
            } else {
                checkCallBtn.textContent = 'Чек';
                checkCallBtn.onclick = () => playerAction('check');
            }
            // Кнопки ставок
            updateBetButton('bet20Btn', 20, player, toCall);
            updateBetButton('bet50Btn', 50, player, toCall);
            updateBetButton('bet100Btn', 100, player, toCall);
            // Кнопка показа карт
            const showBtn = document.getElementById('showBtn');
            if (game.stage === "river") {
                showBtn.classList.remove('hidden');
            } else {
                showBtn.classList.add('hidden');
            }
        }
        function updateBetButton(buttonId, amount, player, toCall) {
            const button = document.getElementById(buttonId);
            const totalNeeded = toCall + amount;
            if (player.balance >= totalNeeded) {
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                button.disabled = true;
                button.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
        // Добавление записи в лог
        function addToLog(message) {
            const log = document.getElementById('gameLog');
            const entry = document.createElement('div');
            entry.textContent = message;
            entry.className = 'text-gray-300';
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
        }
        // Показ модального окна с результатом
        function showWinner(message) {
            document.getElementById('winnerText').innerHTML = message;
            document.getElementById('winnerModal').classList.remove('hidden');
        }
        // Закрытие модального окна
        function closeWinnerModal() {
            document.getElementById('winnerModal').classList.add('hidden');
        }
        // Сброс игры
        function resetGame() {
            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('setupScreen').classList.remove('hidden');
            document.getElementById('gameLog').innerHTML = '';
            // Сброс всех элементов карт
            ['player1Card1', 'player1Card2', 'player2Card1', 'player2Card2', 'flop1', 'flop2', 'flop3', 'turn', 'river'].forEach(id => {
                const element = document.getElementById(id);
                element.innerHTML = '';
                element.className = 'card w-16 hidden';
            });
        }
        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            // Автофокус на первое поле
            document.getElementById('player1Name').focus();
        });
    </script>
</body>
</html>
