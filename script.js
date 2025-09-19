document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const puzzleBoard = document.getElementById('puzzle-board');
    const piecesContainer = document.getElementById('pieces-container');
    const timerElement = document.getElementById('timer');
    const pieceCounterElement = document.getElementById('piece-counter');
    const congratulationsModal = document.getElementById('congratulations-modal');
    const finalTimeElement = document.getElementById('final-time');
    const playerNameInput = document.getElementById('player-name');
    const saveScoreButton = document.getElementById('save-score');
    const leaderboardList = document.getElementById('leaderboard-list');
    const hintButton = document.getElementById('hint-button');
    const puzzlePacksButton = document.getElementById('puzzle-packs-button');
    const puzzlePacksMenu = document.getElementById('puzzle-packs-menu');

    // --- GAME CONSTANTS ---
    const PUZZLE_ROWS = 8;
    const PUZZLE_COLS = 8;
    const TOTAL_PIECES = PUZZLE_ROWS * PUZZLE_COLS;

    // --- IMAGE LIBRARY ---
    // NOTE: Please download these images and place them in the 'images' folder.
    // You can also add more images to this array.
    const imageLibrary = [
        'images/hawa-mahal.jpg',       // https://images.unsplash.com/photo-1617541292198-56ba3affd6b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
        'images/holi-festival.jpg',  // https://images.unsplash.com/photo-1580556213811-4713f41851e3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
        'images/mehendi.jpg',          // https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
        'images/amer-fort.jpg',        // https://images.unsplash.com/photo-1524309784716-6a4be8299c7f?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
        'images/spice-market.jpg'    // https://images.unsplash.com/flagged/photo-1553617569-8ef7a8da3146?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
    ];

    // --- SOUND EFFECTS ---
    // NOTE: Please download sound effects and place them in the 'sounds' folder.
    // You can find free sounds at sites like freesound.org or pixabay.com/sound-effects/
    const sounds = {
        drag: new Audio('sounds/drag.wav'),
        drop: new Audio('sounds/drop.wav'),
        success: new Audio('sounds/success.wav')
    };

    // --- GAME STATE ---
    let timerInterval;
    let seconds = 0;
    let placedPieces = 0;
    let draggedPiece = null;
    let dailyImageSrc = '';

    // --- GAME LOGIC ---

    function getDailyImage() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const imageIndex = dayOfYear % imageLibrary.length;
        return imageLibrary[imageIndex];
    }

    function createPuzzle() {
        dailyImageSrc = getDailyImage();
        const pieceWidth = puzzleBoard.clientWidth / PUZZLE_COLS;
        const pieceHeight = puzzleBoard.clientHeight / PUZZLE_ROWS;
        const pieces = [];

        for (let row = 0; row < PUZZLE_ROWS; row++) {
            for (let col = 0; col < PUZZLE_COLS; col++) {
                // Create puzzle piece
                const piece = document.createElement('div');
                piece.classList.add('puzzle-piece');
                piece.style.width = `${pieceWidth}px`;
                piece.style.height = `${pieceHeight}px`;
                piece.style.backgroundImage = `url(${dailyImageSrc})`;
                piece.style.backgroundSize = `${puzzleBoard.clientWidth}px ${puzzleBoard.clientHeight}px`;
                piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
                piece.draggable = true;
                piece.dataset.row = row;
                piece.dataset.col = col;
                pieces.push(piece);

                // Create puzzle board slot
                const slot = document.createElement('div');
                slot.classList.add('puzzle-slot');
                slot.dataset.row = row;
                slot.dataset.col = col;
                puzzleBoard.appendChild(slot);
            }
        }

        // Shuffle and add pieces to the container
        pieces.sort(() => Math.random() - 0.5);
        pieces.forEach(piece => piecesContainer.appendChild(piece));

        updatePieceCounter();
        startTimer();
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            timerElement.textContent = `${minutes}:${secs}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function updatePieceCounter() {
        pieceCounterElement.textContent = `${placedPieces} / ${TOTAL_PIECES}`;
    }

    function checkWin() {
        if (placedPieces === TOTAL_PIECES) {
            stopTimer();
            sounds.success.play();
            finalTimeElement.textContent = timerElement.textContent;
            congratulationsModal.classList.remove('hidden');
            displayLeaderboard();
        }
    }

    // --- DRAG AND DROP LOGIC ---
    piecesContainer.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('puzzle-piece')) {
            draggedPiece = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
            sounds.drag.play();
        }
    });

    piecesContainer.addEventListener('dragend', (e) => {
        if (draggedPiece) {
            draggedPiece.classList.remove('dragging');
            draggedPiece = null;
        }
    });

    puzzleBoard.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    puzzleBoard.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedPiece && e.target.classList.contains('puzzle-slot')) {
            const slot = e.target;
            const pieceRow = draggedPiece.dataset.row;
            const pieceCol = draggedPiece.dataset.col;
            const slotRow = slot.dataset.row;
            const slotCol = slot.dataset.col;

            if (pieceRow === slotRow && pieceCol === slotCol) {
                // Correct placement
                slot.appendChild(draggedPiece);
                draggedPiece.classList.add('placed');
                draggedPiece.draggable = false;
                placedPieces++;
                updatePieceCounter();
                sounds.drop.play();
                checkWin();
            }
        }
    });

    // --- LEADERBOARD LOGIC ---
    function getLeaderboard() {
        const todayKey = new Date().toISOString().split('T')[0];
        const leaderboard = localStorage.getItem(`leaderboard-${todayKey}`);
        return leaderboard ? JSON.parse(leaderboard) : [];
    }

    function saveToLeaderboard(name, time) {
        const todayKey = new Date().toISOString().split('T')[0];
        const leaderboard = getLeaderboard();
        leaderboard.push({ name, time });
        leaderboard.sort((a, b) => {
            const timeA = a.time.split(':').reduce((acc, t) => (60 * acc) + +t);
            const timeB = b.time.split(':').reduce((acc, t) => (60 * acc) + +t);
            return timeA - timeB;
        });
        localStorage.setItem(`leaderboard-${todayKey}`, JSON.stringify(leaderboard.slice(0, 10)));
    }

    function displayLeaderboard() {
        const leaderboard = getLeaderboard();
        leaderboardList.innerHTML = '';
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<li>No scores yet for today!</li>';
        } else {
            leaderboard.forEach(score => {
                const li = document.createElement('li');
                li.textContent = `${score.name}: ${score.time}`;
                leaderboardList.appendChild(li);
            });
        }
    }

    saveScoreButton.addEventListener('click', () => {
        const name = playerNameInput.value || 'Anonymous';
        const time = finalTimeElement.textContent;
        saveToLeaderboard(name, time);
        displayLeaderboard();
        saveScoreButton.disabled = true;
        playerNameInput.disabled = true;
    });

    // --- MONETIZATION HOOKS ---
    function showRewardedAd() {
        console.log("Placeholder: Showing rewarded ad...");
        // In a real implementation, you would integrate with an ad network SDK here.
        // For this placeholder, we'll immediately call the reward function.
        setTimeout(() => {
            giveHint();
        }, 500); // Simulate ad watch time
    }

    function giveHint() {
        console.log("Placeholder: Giving hint...");
        const unplacedPieces = Array.from(piecesContainer.children);
        if (unplacedPieces.length > 0) {
            const randomPiece = unplacedPieces[Math.floor(Math.random() * unplacedPieces.length)];
            const correctSlot = puzzleBoard.querySelector(`.puzzle-slot[data-row='${randomPiece.dataset.row}'][data-col='${randomPiece.dataset.col}']`);

            if (correctSlot) {
                const slotRect = correctSlot.getBoundingClientRect();
                const hintFlash = document.createElement('div');
                hintFlash.style.position = 'absolute';
                hintFlash.style.left = `${slotRect.left}px`;
                hintFlash.style.top = `${slotRect.top}px`;
                hintFlash.style.width = `${slotRect.width}px`;
                hintFlash.style.height = `${slotRect.height}px`;
                hintFlash.style.backgroundColor = 'rgba(255, 255, 0, 0.7)';
                hintFlash.style.zIndex = '1000';
                hintFlash.style.pointerEvents = 'none';
                document.body.appendChild(hintFlash);

                setTimeout(() => {
                    document.body.removeChild(hintFlash);
                }, 500); // Flash for half a second
            }
        }
    }

    function initiatePayment(packID) {
        console.log(`Placeholder: Initiating payment for ${packID}...`);
        // In a real implementation, you would integrate with a payment gateway like Razorpay here.
        alert(`You've clicked on a premium pack! Payment integration is not yet implemented.`);
    }

    hintButton.addEventListener('click', showRewardedAd);

    puzzlePacksButton.addEventListener('click', () => {
        puzzlePacksMenu.classList.toggle('hidden');
    });

    puzzlePacksMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI' && e.target.dataset.packId) {
            initiatePayment(e.target.dataset.packId);
        }
    });

    // --- INITIALIZE GAME ---
    createPuzzle();
});
