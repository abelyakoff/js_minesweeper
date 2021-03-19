// CONSTANTS

const WIDTH = 20; // number of game board columns
const HEIGHT = 20; // number of game board rows
const MINES = 60; // number of mines on game board
const CELL_SIZE = 30; // cell width and height in pixels

const BORDER_SIZE = Math.round(CELL_SIZE * 0.1); // cell border thickness in pixels
const IMAGE_SIZE = Math.round((CELL_SIZE - BORDER_SIZE) * 0.75); // mine and flag image width and height in pixels
const EMPTY_CELLS = WIDTH * HEIGHT - MINES; // number of empty cells on game board

// VARIABLES

let cells; // array of mines and numbers
let gameboard; // arrays of divs seen by player
let gameWon = false;
let markersRemaining = MINES;
let time = 0;
let timerId;

// DOM ELEMENTS

const root = document.documentElement;
root.style.setProperty('--gameboard-width', (WIDTH * CELL_SIZE).toString() + "px");
root.style.setProperty('--gameboard-height', (HEIGHT * CELL_SIZE).toString() + "px");
root.style.setProperty('--cell-size', CELL_SIZE.toString() + "px");
root.style.setProperty('--image-size', IMAGE_SIZE.toString() + "px");
root.style.setProperty('--border-size', BORDER_SIZE.toString() + "px");
root.style.setProperty('--digit-size', (CELL_SIZE / 28).toFixed(2).toString() + "rem");

const gameboardDiv = document.querySelector('.gameboard');
const newGameButton = document.querySelector('.menu-start-button');
const markersRemainingSpan = document.getElementById('markers-remaining');
const timeSpan = document.getElementById('time');

markersRemainingSpan.innerHTML = markersRemaining;
timeSpan.innerHTML = time;

const statusWaiting = document.getElementById('status-waiting');
const statusInProgress = document.getElementById('status-in-progress');
const statusLose = document.getElementById('status-lose');
const statusWin = document.getElementById('status-win');

// FUNCTIONS

function newGame() {

    // reset game status

    if (timerId) { clearInterval(timerId); }
    markersRemaining = MINES;
    time = 0;
    cells = [];
    gameboard = [];
    gameWon = false;
    gameboardDiv.innerHTML = "";
    newGameButton.innerText = "New Game";

    markersRemainingSpan.innerHTML = markersRemaining;
    timeSpan.innerHTML = time;

    statusWaiting.style.display = 'none';
    statusInProgress.style.display = 'block';
    statusLose.style.display = 'none';
    statusWin.style.display = 'none';

    // create gameboard grid with event listeners

    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            const div = document.createElement('div');
            div.classList.add('cell');
            div.setAttribute('id', (i * WIDTH + j).toString());
            div.addEventListener('click', checkCell);
            div.addEventListener('contextmenu', toggleMarker);
            gameboard.push(div);
            cells.push(0);
            gameboardDiv.appendChild(div);
        }
    }

    populateMinefield();
    calculateMinefield();

}

function populateMinefield() {

    let i = 0;

    while (i < MINES) {
        randomCell = Math.floor(Math.random() * WIDTH * HEIGHT);
        if (cells[randomCell] !== 'X') {
            cells[randomCell] = 'X';
            i++;
        }
    }

}

function calculateMinefield() {

    for (let i = 0; i < cells.length; i++) {

        if (cells[i] === 'X') continue;

        let mines = 0;

        if (i >= WIDTH && cells[i - WIDTH] === 'X') { mines++; }
        if (i < (HEIGHT - 1) * WIDTH && cells[i + WIDTH] === 'X') { mines++; }
        if (i % WIDTH && cells[i - 1] === 'X') { mines++; }
        if (i % WIDTH != WIDTH - 1 && cells[i + 1] === 'X') { mines++; }

        if (i >= WIDTH && i % WIDTH && cells[i - WIDTH - 1] === 'X') { mines++; }
        if (i >= WIDTH && i % WIDTH != WIDTH - 1 && cells[i - WIDTH + 1] === 'X') { mines++; }
        if (i < (HEIGHT - 1) * WIDTH && i % WIDTH && cells[i + WIDTH - 1] === 'X') { mines++; }
        if (i < (HEIGHT - 1) * WIDTH && i % WIDTH != WIDTH - 1 && cells[i + WIDTH + 1] === 'X') { mines++; }

        cells[i] = mines;

        gameboard[i].classList.add('cell-' + mines.toString());

    }
}

function checkCell(e) {

    if (gameboard.filter(element => element.classList.contains('cell-revealed')).length === 0) {
        timerId = setInterval(() => {
            time += 1;
            timeSpan.innerHTML = time;
        }, 1000);
    }

    const id = parseInt(e.target.id);
    checkCellRecursive(id);

    // check for win state
    if (gameboard.filter(element => element.classList.contains('cell-revealed')).length === EMPTY_CELLS) {
        gameWon = true;
        gameOver();
    }

}

function checkCellRecursive(id) {

    if (!gameboard[id].classList.contains('cell-revealed')) {

        gameboard[id].classList.add('cell-revealed');

        if (gameboard[id].classList.contains('flag')) {
            gameboard[id].classList.remove('flag');
            markersRemaining += 1;
            markersRemainingSpan.innerHTML = markersRemaining;
        }

        if (cells[id] === 'X') {
            gameboard[id].classList.add('mine-revealed', 'mine-exploded');
            gameOver();
        } else if (cells[id] === 0) {

            if (id >= WIDTH) { checkCellRecursive(id - WIDTH); }
            if (id < (HEIGHT - 1) * WIDTH) { checkCellRecursive(id + WIDTH); }
            if (id % WIDTH) { checkCellRecursive(id - 1); }
            if (id % WIDTH != WIDTH - 1) { checkCellRecursive(id + 1); }

            if (id >= WIDTH && id % WIDTH) { (checkCellRecursive(id - WIDTH - 1)); }
            if (id >= WIDTH && id % WIDTH != WIDTH - 1) { (checkCellRecursive(id - WIDTH + 1)); }
            if (id < (HEIGHT - 1) * WIDTH && id % WIDTH) { (checkCellRecursive(id + WIDTH - 1)); }
            if (id < (HEIGHT - 1) * WIDTH && id % WIDTH != WIDTH - 1) { (checkCellRecursive(id + WIDTH + 1)); }

        } else { gameboard[id].innerHTML = cells[id]; }

    }

}

function toggleMarker(e) {

    e.preventDefault();
    const id = parseInt(e.target.id);

    // remove flag marker if present
    if (gameboard[id].classList.contains('flag')) {
        gameboard[id].classList.remove('flag');
        markersRemaining += 1;
        markersRemainingSpan.innerHTML = markersRemaining;
    }

    // add flag marker if absent
    else if (!gameboard[id].classList.contains('cell-revealed')) {
        gameboard[id].classList.add('flag');
        markersRemaining -= 1;
        markersRemainingSpan.innerHTML = markersRemaining;
    }

}

function gameOver() {
    clearInterval(timerId);
    statusInProgress.style.display = 'none';
    for (let i = 0; i < gameboard.length; i++) {
        gameboard[i].removeEventListener('click', checkCell);
        gameboard[i].removeEventListener('contextmenu', toggleMarker);
        if (cells[i] === 'X' && !gameWon) { gameboard[i].classList.add('mine-revealed'); } // show all mines
        if (gameboard[i].classList.contains('flag') && cells[i] !== 'X') { gameboard[i].classList.add('flag-incorrect'); } // mark incorrectly placed flags
    }
    if (gameWon) { statusWin.style.display = 'block'; }
    else { statusLose.style.display = 'block'; }
}

// GAME START

newGameButton.addEventListener('click', newGame);
