let board = document.getElementById("board");
let current = 0;
let timerOn = false;
let t;
let started = false;
let numRows;
let numColumns;
let numMines;
let flags;

//starts the game off in easy mode
init(8, 10, 10);

//lets usrer start a new game
document.querySelector("#overlay").addEventListener("click", () => {
  document.querySelector("#overlay").classList.remove("active");
  init(numRows, numColumns, numMines);
});


//generates board
function init(r, c, m) {
  numRows = r;
  numColumns = c;
  numMines = m;
  flags = m;
  document.querySelector("#flag").innerHTML = "Flags: " + flags;
  board.innerHTML = "";
  for (let i = 0; i < r; i++) {
    let row = board.insertRow(i);
    for (let j = 0; j < c; j++) {
      let column = row.insertCell(j);
    }
  }
  //binds right and left clicks to each cell in the board
  document.querySelectorAll("#board td").forEach(e => e.addEventListener("click", function() {
    leftClick(e);
  }));
  document.querySelectorAll("#board td").forEach(e => e.addEventListener("contextmenu", function() {
    rightClick(e);
  }));
  //disables context menu on the board
  document.querySelectorAll("#board, .menu, #stats").forEach(e => e.addEventListener("contextmenu", n => {
    n.preventDefault();
  }));
  stopTimer();
}

//place mines on board randomly
function placeMines(clicked) {
  let placed = 0;
  while (placed < numMines) {
    let randRow = Math.floor(Math.random() * numRows);
    let randColumn = Math.floor(Math.random() * numColumns);
    let cell = board.rows[randRow].cells[randColumn];
    if ((cell.className !== "mine") && (cell.className !== "noMine")) {
      cell.classList.add("mine");
      placed++;
    }
  }
}

//find adjacent cells to a clicked cell
function findAdjacent(cell) {
  let cellRow = cell.parentNode.rowIndex;
  let cellColumn = cell.cellIndex;
  cell.classList.add("noMine");
  
  for (let i = (cellRow > 0 ? -1 : 0); i <= (cellRow < numRows ? 1 : 0); i++) {
    for (let j = (cellColumn > 0 ? -1 : 0); j <= (cellColumn < numColumns ? 1 : 0); j++) {
        if (i !== 0 || j !== 0) {
          if ((-1 < cellRow + i) && (cellRow + i < numRows) && (-1 < cellColumn + j) && (cellColumn + j < numColumns)) {
            board.rows[cellRow + i].cells[cellColumn + j].classList.add("noMine");
          }
        }
    }
  }
}

//reveals cells adjacent to clicked cell
function revealAdjacent(cell) {
  let cellRow = cell.parentNode.rowIndex;
  let cellColumn = cell.cellIndex;
  
  for (let i = (cellRow > 0 ? -1 : 0); i <= (cellRow < numRows ? 1 : 0); i++) {
    for (let j = (cellColumn > 0 ? -1 : 0); j <= (cellColumn < numColumns ? 1 : 0); j++) {
        if (i !== 0 || j !== 0) {
          if ((-1 < cellRow + i) && (cellRow + i < numRows) && (-1 < cellColumn + j) && (cellColumn + j < numColumns)) {
            if (!board.rows[cellRow + i].cells[cellColumn + j].classList.contains("leftClicked")) {
              leftClick(board.rows[cellRow + i].cells[cellColumn + j]);
            }
          }
        }
    }
  }
}

//finds cell value (how many mines are adjacent to the cell)
function cellValues(cell) {
  let cellRow = cell.parentNode.rowIndex;
  let cellColumn = cell.cellIndex;
  let count = 0;

  for (let i = (cellRow > 0 ? -1 : 0); i <= (cellRow < numRows ? 1 : 0); i++) {
    for (let j = (cellColumn > 0 ? -1 : 0); j <= (cellColumn < numColumns ? 1 : 0); j++) {
      if (i !== 0 || j !== 0) {
        if ((-1 < cellRow + i) && (cellRow + i < numRows) && (-1 < cellColumn + j) && (cellColumn + j < numColumns)) {
          if (board.rows[cellRow + i].cells[cellColumn + j].classList.contains("mine")) {
            count++;
          }
        }
      }
    }
  }
  return count;
}

//assign colour to each mine value
function assignNumberColour(value, cell) {
  if (value === 1) {
    cell.classList.add("one");
  } else if (value === 2) {
    cell.classList.add("two");
  } else if (value === 3) {
    cell.classList.add("three");
  } else if (value === 4) {
    cell.classList.add("four");
  } else if (value === 5) {
    cell.classList.add("five");
  } else if (value === 6) {
    cell.classList.add("six");
  } else if (value === 7) {
    cell.classList.add("seven");
  } else if (value === 8) {
    cell.classList.add("eight");
  }
}

//when a cell is left clicked
function leftClick(cell) {
  if (!started) {
    startTimer();
    started = true;
    findAdjacent(cell);
    placeMines(cell);
  }
  if (cell.className !== "leftClicked" && !cell.classList.contains("rightClicked")) {
    if (cell.classList.contains("mine")) {
      revealMines(cell);
    } else {
      console.log(cell.classList);
      cell.className = "leftClicked";
      let mineValue = cellValues(cell);
      assignNumberColour(mineValue, cell);
      if (mineValue === 0) {
        revealAdjacent(cell);
      }
    }
  }
  if (checkIfWon()) {
    gameWon();
  }
}

//when a cell is right clicked
function rightClick(cell) {
  if (cell.classList.contains("rightClicked")) {
    cell.classList.remove("rightClicked");
    flags++;
    document.querySelector("#flag").innerHTML = "Flags: " + flags;
  } else if ((cell.className !== "leftClicked") && ((cell.classList.length === 0) || (cell.classList.contains("mine")))) {
    flags--;
    document.querySelector("#flag").innerHTML = "Flags: " + flags;
    cell.classList.add("rightClicked");
  }
}

//reveal all mines
function revealMines(clicked) {
  clicked.className = "mineRevealed";
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numColumns; j++) {
      if (board.rows[i].cells[j].classList.contains("mine")) {
        board.rows[i].cells[j].className = "mineRevealed";
      }
    }
  }
  gameOver();
}

//game over overlay
function gameOver() {
  clearTimeout(t);
  document.querySelector("#overlay").classList.toggle("active");
  document.querySelector("#overlay").innerHTML = "You lose. <br> Time Elapsed: " + (current - 1) + " sec. <br> Click anywhere to start a new game.";
}

//game won overlay
function gameWon() {
  clearTimeout(t);
  document.querySelector("#overlay").classList.toggle("active");
  document.querySelector("#overlay").innerHTML = "Congratulations you win!! <br> Time Elapsed: " + (current - 1) + " sec. <br> Click anywhere to start a new game.";
}

//check to see if player has won game
function checkIfWon() {
  let won = false;
  let count = 0;
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numColumns; j++) {
      if (!board.rows[i].cells[j].classList.contains("mine") && board.rows[i].cells[j].classList.contains("leftClicked")) {
        count++;
      } 
    }
  }
  if (count === (numRows * numColumns) - numMines) {
    won = true;
  }
  return won;
}

//timer function
function timerCount() {
  let text = document.getElementById("time");
  text.innerHTML = "Time: " + current;
  current++;
  t = setTimeout(timerCount, 1000);
}

//start the timer
function startTimer() {
  if (!timerOn) {
    timerOn = true;
    timerCount();
  }
}

//stop the timer
function stopTimer() {
  clearTimeout(t);
  current = 0;
  let text = document.getElementById("time");
  text.innerHTML = "Time: " + current;
  timerOn = false;
  started = false;
}
