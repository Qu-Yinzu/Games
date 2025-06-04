 (() => {
    const gameContainer = document.getElementById("game");
    const moveCountEl = document.getElementById("moveCount");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const resetBtn = document.getElementById("resetBtn");
    const messageEl = document.getElementById("message");

    const size = 4;
    let board = [];
    let emptyPos = { row: size-1, col: size-1 };
    let moveCount = 0;
    let isShuffling = false;

    function createTiles() {
      gameContainer.innerHTML = "";
      for(let i = 0; i < size*size; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        if(i === size*size -1) {
          tile.classList.add("empty");
        } else {
          tile.textContent = i + 1;
          tile.setAttribute("tabindex", "0");
          tile.setAttribute("role", "button");
          tile.setAttribute("aria-label", `Tile ${i + 1}`);
        }
        gameContainer.appendChild(tile);
      }
    }

    function posToIndex(row, col) {
      return row * size + col;
    }

    function getTileAt(row, col) {
      return gameContainer.children[posToIndex(row, col)];
    }

    function swapTiles(pos1, pos2) {
      const tile1 = getTileAt(pos1.row, pos1.col);
      const tile2 = getTileAt(pos2.row, pos2.col);

      // Swap text content & classes (empty class)
      const tempText = tile1.textContent;
      const tempEmpty = tile1.classList.contains("empty");

      tile1.textContent = tile2.textContent;
      tile2.textContent = tempText;

      if(tempEmpty) {
        tile1.classList.remove("empty");
        tile2.classList.add("empty");
        tile2.setAttribute("tabindex", "0");
        tile2.setAttribute("role", "button");
        tile2.setAttribute("aria-label", `Tile ${tile2.textContent}`);
        tile1.removeAttribute("tabindex");
        tile1.removeAttribute("role");
        tile1.removeAttribute("aria-label");
      } else if(tile2.classList.contains("empty")) {
        tile1.classList.add("empty");
        tile1.setAttribute("tabindex", "0");
        tile1.setAttribute("role", "button");
        tile1.setAttribute("aria-label", `Tile ${tile1.textContent}`);
        tile2.classList.remove("empty");
        tile2.removeAttribute("tabindex");
        tile2.removeAttribute("role");
        tile2.removeAttribute("aria-label");
      } else {
        // Both non-empty (should not happen)
      }
    }

    function canMove(row, col) {
      if(row < 0 || col < 0 || row >= size || col >= size) return false;
      const dr = Math.abs(emptyPos.row - row);
      const dc = Math.abs(emptyPos.col - col);
      return (dr + dc === 1);
    }

    function moveTile(row, col) {
      if(!canMove(row, col) || isShuffling) return false;
      swapTiles({row, col}, emptyPos);
      emptyPos = {row, col};
      moveCount++;
      moveCountEl.textContent = moveCount;
      if(checkSolved()) {
        showMessage();
      }
      return true;
    }

    function shuffle(steps = 1000) {
      isShuffling = true;
      moveCount = 0;
      moveCountEl.textContent = 0;
      hideMessage();

      let lastMove = null;
      for(let i = 0; i < steps; i++) {
        const neighbors = [];
        if(emptyPos.row > 0 && lastMove !== 'down') neighbors.push('up');
        if(emptyPos.row < size -1 && lastMove !== 'up') neighbors.push('down');
        if(emptyPos.col > 0 && lastMove !== 'right') neighbors.push('left');
        if(emptyPos.col < size -1 && lastMove !== 'left') neighbors.push('right');

        const dir = neighbors[Math.floor(Math.random() * neighbors.length)];
        let target;
        switch(dir) {
          case 'up': target = {row: emptyPos.row -1, col: emptyPos.col}; lastMove = 'up'; break;
          case 'down': target = {row: emptyPos.row +1, col: emptyPos.col}; lastMove = 'down'; break;
          case 'left': target = {row: emptyPos.row, col: emptyPos.col -1}; lastMove = 'left'; break;
          case 'right': target = {row: emptyPos.row, col: emptyPos.col +1}; lastMove = 'right'; break;
        }
        swapTiles(target, emptyPos);
        emptyPos = target;
      }
      isShuffling = false;
    }

    function reset() {
      isShuffling = true;
      moveCount = 0;
      moveCountEl.textContent = 0;
      hideMessage();
      // Reset tiles to solved state
      for(let row = 0; row < size; row++) {
        for(let col = 0; col < size; col++) {
          const tile = getTileAt(row, col);
          if(row === size-1 && col === size-1) {
            tile.textContent = "";
            tile.classList.add("empty");
            tile.removeAttribute("tabindex");
            tile.removeAttribute("role");
            tile.removeAttribute("aria-label");
            emptyPos = {row, col};
          } else {
            tile.textContent = row * size + col + 1;
            tile.classList.remove("empty");
            tile.setAttribute("tabindex", "0");
            tile.setAttribute("role", "button");
            tile.setAttribute("aria-label", `Tile ${tile.textContent}`);
          }
        }
      }
      isShuffling = false;
    }

    function checkSolved() {
      for(let row = 0; row < size; row++) {
        for(let col = 0; col < size; col++) {
          const idx = posToIndex(row, col);
          const tile = getTileAt(row, col);
          if(row === size-1 && col === size-1) {
            if(!tile.classList.contains("empty")) return false;
          } else {
            if(tile.textContent != idx + 1) return false;
          }
        }
      }
      return true;
    }

    function showMessage() {
      messageEl.classList.add("show");
    }
    function hideMessage() {
      messageEl.classList.remove("show");
    }

    function handleClick(event) {
      if(event.target.classList.contains("tile") && !event.target.classList.contains("empty") && !isShuffling) {
        const index = Array.from(gameContainer.children).indexOf(event.target);
        const row = Math.floor(index / size);
        const col = index % size;
        moveTile(row, col);
      }
    }
    function handleKeyDown(event) {
      if(event.target.classList.contains("tile") && !event.target.classList.contains("empty") && !isShuffling) {
        if(event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          const index = Array.from(gameContainer.children).indexOf(event.target);
          const row = Math.floor(index / size);
          const col = index % size;
          moveTile(row, col);
        }
      }
    }

    createTiles();
    reset();

    shuffleBtn.addEventListener("click", () => shuffle(2000));
    resetBtn.addEventListener("click", reset);
    gameContainer.addEventListener("click", handleClick);
    gameContainer.addEventListener("keydown", handleKeyDown);
  })();