// Initialize players
let denominations = [1000,500,100,50,25,10,5,1];
let potAmount = 0;
let gameMode = localStorage.getItem("gameMode") || "Desktop";


// Get starting chips from poker.html input if first game
let startingChips = 1000; // default fallback
try {
  // Check if opener window exists and has the #chips input
  const chipsInput = window.opener?.document.getElementById("chips");
  if (chipsInput && !localStorage.getItem("startingChips")) {
    startingChips = parseInt(chipsInput.value) || startingChips;
    localStorage.setItem("startingChips", startingChips);
  } else if (localStorage.getItem("startingChips")) {
    startingChips = parseInt(localStorage.getItem("startingChips"));
  }
} catch(e) {
  // fallback if opener is not available
}

// Define players; preserve chips from previous rounds if already stored
let storedPlayers = JSON.parse(localStorage.getItem("players"));
let players = storedPlayers && storedPlayers.length > 0 ? storedPlayers : [
  { name: 'Thomas', chips: startingChips, folded: false },
  { name: 'Kylo', chips: startingChips, folded: false }
];

// Save player chips on each update
function savePlayers() {
  localStorage.setItem("players", JSON.stringify(players));
}


// Get starting chips from poker.html if first game
function setStartingChipsFromInput() {
  try {
    const chipsInput = window.opener?.document.getElementById("chips");
    if (chipsInput && !localStorage.getItem("startingChips")) {
      startingChips = parseInt(chipsInput.value) || startingChips;
      localStorage.setItem("startingChips", startingChips);
      players.forEach(p => p.chips = startingChips);
    }
  } catch (err) {
    // window.opener may be null, fallback to previous startingChips
  }
}

setStartingChipsFromInput();

function clearDraggableChips() {
  document.querySelectorAll(".draggable").forEach(chip => chip.remove());
}


// Render all players
function renderPlayers() {
  document.querySelectorAll(".player-area").forEach(el => el.remove());

  players.forEach((player, idx) => {
    const area = document.createElement("div");
    area.className = "player-area";

// Positioning players
if (idx === 0) {
  area.style.bottom = "20px";
  area.style.left = "50%";
  area.style.transform = "translateX(-50%)";
} else if (idx === 1) {
  area.style.top = "30px";
  area.style.left = "50%";
  // ✅ Only rotate if Tabletop Touch
  area.style.transform = gameMode === "Desktop"
    ? "translateX(-50%)"
    : "translateX(-50%) rotate(180deg)";
} else if (idx === 2) {
  area.style.left = "20px";
  area.style.top = "50%";
  area.style.transform = gameMode === "Desktop"
    ? "translateY(-50%)"
    : "translateY(-50%) rotate(90deg)";
} else if (idx === 3) {
  area.style.right = "20px";
  area.style.top = "50%";
  area.style.transform = gameMode === "Desktop"
    ? "translateY(-50%)"
    : "translateY(-50%) rotate(-90deg)";
} else if (idx === 4) {
  area.style.bottom = "20px";
  area.style.left = "75%";
  area.style.transform = "translateX(-50%)";
} else if (idx === 5) {
  area.style.top = "30px";
  area.style.left = "25%";
  area.style.transform = gameMode === "Desktop"
    ? "translateX(-50%)"
    : "translateX(-50%) rotate(180deg)";
} else if (idx === 6) {
  area.style.bottom = "20px";
  area.style.left = "25%";
  area.style.transform = "translateX(-50%)";
} else if (idx === 7) {
  area.style.top = "30px";
  area.style.left = "75%";
  area.style.transform = gameMode === "Desktop"
    ? "translateX(-50%)"
    : "translateX(-50%) rotate(180deg)";
}





    const chipDiv = document.createElement("div");
    chipDiv.className = "chips";

    denominations.forEach(denom => {
      let count = Math.floor(player.chips / denom);
      if (count > 10) count = 10;
      if (count > 0) {
        const stackDiv = document.createElement("div");
        stackDiv.style.position = "relative";
        stackDiv.style.width = "40px";
        stackDiv.style.height = "40px";

        // Static chip
        const staticImg = document.createElement("img");
        staticImg.src = `${denom}.png`;
        staticImg.classList.add("static-chip");
        stackDiv.appendChild(staticImg);

        // Draggable chip
        const dragImg = document.createElement("img");
        const trySrc = `${denom}-${count}.png`;
        dragImg.src = trySrc;
        dragImg.onerror = () => { dragImg.src = `${denom}.png`; };
        dragImg.classList.add("draggable");
        dragImg.dataset.denom = denom;
        dragImg.dataset.ownerIdx = idx;
        dragImg.dataset.inPot = "false";
        dragImg.dataset.disabled = player.folded ? "true" : "false";
        stackDiv.appendChild(dragImg);

        chipDiv.appendChild(stackDiv);
        // Display chip value on top of stack
        const valueDiv = document.createElement("div");
        valueDiv.className = "chip-value";
        valueDiv.textContent = denom;
        valueDiv.style.position = "absolute";
        valueDiv.style.top = "-20px";          // offset above stack
        valueDiv.style.left = "50%";           // center horizontally
        valueDiv.style.transform = "translateX(-50%)";
        valueDiv.style.pointerEvents = "none"; // so it doesn't block drag
        valueDiv.style.color = "white";        // visible on top of chips
        valueDiv.style.fontWeight = "bold";
        valueDiv.style.fontSize = "14px";
        valueDiv.style.zIndex = "1000";        // above all chips

        stackDiv.appendChild(valueDiv);


      }
    });

    // Player info
    const info = document.createElement("div");
    info.className = "player-info";

// Fold button
const foldBtn = document.createElement("button");
foldBtn.className = "fold-btn";
foldBtn.textContent = "Fold";
foldBtn.disabled = player.folded || false;
foldBtn.addEventListener("click", () => {
  if (player.folded) return; // already folded
  player.folded = true;
  foldBtn.disabled = true;

  // Disable this player's draggable chips
  const playerChips = document.querySelectorAll(`.draggable[data-owner-idx='${idx}']`);
  playerChips.forEach(c => c.dataset.inPot = "true"); // prevent dragging

  // Check how many players are left
  const activePlayers = players.filter(p => !p.folded);
  if (activePlayers.length === 1) {
  const winner = activePlayers[0];
  winner.chips += potAmount;

  // Reset pot
  potAmount = 0;

  // Update pot display visually
  updatePotDisplay();

  // Remove all draggable chips
  clearDraggableChips();

  // Reset fold buttons & folded status
  players.forEach((p) => p.folded = false);

  // Re-render players so chip stacks match balances
  renderPlayers();
}

});



    const nameDiv = document.createElement("div");
    nameDiv.textContent = `${player.name}: ${player.chips}`;
    nameDiv.className = "name-div";

    info.appendChild(foldBtn);
    info.appendChild(nameDiv);

    area.appendChild(chipDiv);
    area.appendChild(info);

    document.body.appendChild(area);
  });

  enableDrag();
}

function enableDrag() {
  const draggables = document.querySelectorAll(".draggable");
  const potEl = document.getElementById("pot");
  const potZone = potEl.getBoundingClientRect();

  draggables.forEach(chip => {
    let isDragging = false;
    let startX, startY, offsetX, offsetY;
    let originalParent, originalNextSibling;

    const getClientXY = (e) => e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

    const startDrag = (e) => {
      if (chip.dataset.inPot === "true" || chip.dataset.disabled === "true") return;

      isDragging = true;
      const { x, y } = getClientXY(e);

      const rect = chip.getBoundingClientRect();
      startX = rect.left + window.scrollX;
      startY = rect.top + window.scrollY;
      offsetX = x - startX;
      offsetY = y - startY;

      originalParent = chip.parentNode;
      originalNextSibling = chip.nextSibling;

      document.body.appendChild(chip);
      chip.style.position = "absolute";
      chip.style.left = `${startX}px`;
      chip.style.top = `${startY}px`;
      chip.style.transform = `translate(0px, 0px)`;
      chip.style.zIndex = 1000;

      e.preventDefault();
    };

    const moveDrag = (e) => {
      if (!isDragging) return;
      const { x, y } = getClientXY(e);
      const dx = x - offsetX - startX;
      const dy = y - offsetY - startY;
      chip.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;

      const chipRect = chip.getBoundingClientRect();
      const chipCenterX = chipRect.left + chipRect.width / 2;
      const chipCenterY = chipRect.top + chipRect.height / 2;

      if (
        chipCenterX >= potZone.left &&
        chipCenterX <= potZone.right &&
        chipCenterY >= potZone.top &&
        chipCenterY <= potZone.bottom
      ) {
        const owner = players[chip.dataset.ownerIdx];
        const value = parseInt(chip.dataset.denom);

        owner.chips -= value;
        potAmount += value;

        chip.dataset.inPot = "true";
        chip.style.pointerEvents = "none";

        updatePotDisplay();
        renderPlayers(); // only re-renders static chips
      } else {
        // Reset to original stack
        if (originalNextSibling) originalParent.insertBefore(chip, originalNextSibling);
        else originalParent.appendChild(chip);

        // ✅ Reset styles so it stacks properly
        chip.style.position = "absolute";
        chip.style.left = "0px";
        chip.style.top = "0px";
        chip.style.transform = "translate(0, 0)";
        chip.style.zIndex = "";
      }

    };

    chip.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("mouseup", endDrag);

    chip.addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("touchmove", moveDrag, { passive: false });
    document.addEventListener("touchend", endDrag);
  });
}

function updatePotDisplay() {
  let gameMode = localStorage.getItem("gameMode") || "Desktop";
  if (gameMode !== "Desktop") { document.querySelector(".pot-up").textContent = `Pot: ${potAmount}`; }
  document.querySelector(".pot-down").textContent = `Pot: ${potAmount}`;
}


function showPlayerWinnerSelectionButtons() {
  // Remove existing selection buttons first
  document.querySelectorAll(".player-select-btn").forEach(btn => btn.remove());

  players.forEach((player, idx) => {
    if (player.folded) return; // skip folded players

    const area = document.querySelectorAll(".player-area")[idx];
    if (!area) return;

    const chipDiv = area.querySelector(".chips");
    if (!chipDiv) return;

    const rect = chipDiv.getBoundingClientRect(); // get chip stack position

    const selectBtn = document.createElement("button");
    selectBtn.textContent = player.name;
    selectBtn.className = "player-select-btn";
    selectBtn.style.position = "fixed";
    selectBtn.style.padding = "5px 10px";
    selectBtn.style.fontSize = "12px";
    selectBtn.style.cursor = "pointer";
    selectBtn.style.zIndex = 3001; // above overlay

    // Position button centered above chip stack
    selectBtn.style.left = `${rect.left + rect.width / 2}px`;
    selectBtn.style.top = `${rect.top}px`; // 30px above chip stack
    selectBtn.style.transform = "translateX(-50%)";

    // Toggle selection
    selectBtn.addEventListener("click", () => {
      const prizeIdx = prizePool.indexOf(idx);
      if (prizeIdx === -1) {
        // Add to prize pool
        prizePool.push(idx);
        selectBtn.style.backgroundColor = "green";
        ensureConfirmButton();
      } else {
        // Remove from prize pool
        prizePool.splice(prizeIdx, 1);
        selectBtn.style.backgroundColor = "";
        checkConfirmButtonVisibility();
      }
    });

    document.body.appendChild(selectBtn);
  });
}

function showPlayerRebuySelectionButtons() {
  // Remove existing selection buttons first
  document.querySelectorAll(".player-select-btn").forEach(btn => btn.remove());

  players.forEach((player, idx) => {

    const area = document.querySelectorAll(".player-area")[idx];
    if (!area) return;

    const chipDiv = area.querySelector(".chips");
    if (!chipDiv) return;

    const rect = chipDiv.getBoundingClientRect(); // get chip stack position

    const selectBtn = document.createElement("button");
    selectBtn.textContent = player.name;
    selectBtn.className = "player-select-btn";
    selectBtn.style.position = "fixed";
    selectBtn.style.padding = "5px 10px";
    selectBtn.style.fontSize = "12px";
    selectBtn.style.cursor = "pointer";
    selectBtn.style.zIndex = 3001; // above overlay

    // Position button centered above chip stack
    selectBtn.style.left = `${rect.left + rect.width / 2}px`;
    selectBtn.style.top = `${rect.top}px`; // 30px above chip stack
    selectBtn.style.transform = "translateX(-50%)";

    // Toggle selection
    selectBtn.addEventListener("click", () => {
      const rebuyIdx = rebuyPool.indexOf(idx);
      if (rebuyIdx === -1) {
        // Add to Rebuy pool
        rebuyPool.push(idx);
        selectBtn.style.backgroundColor = "green";
        ensureRebuyConfirmButton();
      } else {
        // Remove from Rebuy pool
        rebuyPool.splice(rebuyIdx, 1);
        selectBtn.style.backgroundColor = "";
        checkRebuyConfirmButtonVisibility();
      }
    });

    document.body.appendChild(selectBtn);
  });
}

// Create confirm button if not already existing
function ensureConfirmButton() {
    let confirmBtn = document.getElementById("confirmBtn");
    if (!confirmBtn) {
      confirmBtn = document.createElement("button");
      confirmBtn.id = "confirmBtn";
      confirmBtn.textContent = "Confirm";
      confirmBtn.style.position = "fixed";
      confirmBtn.style.bottom = "20px";
      confirmBtn.style.right = "20px";
      confirmBtn.style.padding = "10px 15px";
      confirmBtn.style.backgroundColor = "green";
      confirmBtn.style.color = "white";
      confirmBtn.style.border = "none";
      confirmBtn.style.cursor = "pointer";
      confirmBtn.style.zIndex = 3001; // above cancel button
  
      // Attach click event here
      confirmBtn.addEventListener("click", () => {
        if (prizePool.length === 0) return;
  
        // 1. Distribute pot among selected winners
        const share = Math.floor(potAmount / prizePool.length);
        let remainder = potAmount % prizePool.length;
  
        prizePool.forEach(idx => {
          players[idx].chips += share;
          if (remainder > 0) {
            players[idx].chips += 1;
            remainder--;
          }
        });
  
        // 2. Reset pot numerically and visually
        potAmount = 0;
        updatePotDisplay();
  
        // 3. Remove all draggable chips from board
        clearDraggableChips();
  
        // 4. Reset all fold statuses and enable fold buttons & chips
        players.forEach((p, idx) => {
          p.folded = false;
          const area = document.querySelectorAll(".player-area")[idx];
          if (area) {
            area.querySelectorAll(".fold-btn").forEach(btn => btn.disabled = false);
            area.querySelectorAll(".draggable").forEach(chip => chip.dataset.disabled = "false");
          }
        });
  
        // 5. Remove overlay, cancel button, confirm button, and player selection buttons
        document.getElementById("winnerOverlay")?.remove();
        document.getElementById("cancelBtn")?.remove();
        confirmBtn.remove();
        document.querySelectorAll(".player-select-btn").forEach(btn => btn.remove());
  
        // 6. Render new chips for all players based on updated balances
        renderPlayers();
  
        // 7. Clear prize pool
        prizePool = [];
      });
  
      document.body.appendChild(confirmBtn);
    }
  }

function ensureRebuyConfirmButton() {
    let rebuyConfirmBtn = document.getElementById("rebuyConfirmBtn");
    const rebuyAmount = parseInt(localStorage.getItem("Rebuy")) || 0;
    
    if (!rebuyConfirmBtn) {
      rebuyConfirmBtn = document.createElement("button");
      rebuyConfirmBtn.id = "rebuyConfirmBtn";
      rebuyConfirmBtn.textContent = "Confirm";
      rebuyConfirmBtn.style.position = "fixed";
      rebuyConfirmBtn.style.bottom = "75px";
      rebuyConfirmBtn.style.right = "20px";
      rebuyConfirmBtn.style.padding = "10px 15px";
      rebuyConfirmBtn.style.backgroundColor = "green";
      rebuyConfirmBtn.style.color = "white";
      rebuyConfirmBtn.style.border = "none";
      rebuyConfirmBtn.style.cursor = "pointer";
      rebuyConfirmBtn.style.zIndex = 3001; // above cancel button
  
      // Attach click event here
      rebuyConfirmBtn.addEventListener("click", () => {
        if (rebuyPool.length === 0) return;
  
        rebuyPool.forEach(idx => {
          players[idx].chips += rebuyAmount;
        });
  
        // 5. Remove overlay, cancel button, confirm button, and player selection buttons
        document.getElementById("rebuyOverlay")?.remove();
        document.getElementById("rebuyCancelBtn")?.remove();
        rebuyConfirmBtn.remove();
        document.querySelectorAll(".player-select-btn").forEach(btn => btn.remove());
  
        // 6. Render new chips for all players based on updated balances
        renderPlayers();
  
        // 7. Clear prize pool
        rebuyPool = [];
      });
  
      document.body.appendChild(rebuyConfirmBtn);
    }
  }
  

// Hide confirm button if prize pool is empty
function checkConfirmButtonVisibility() {
  const confirmBtn = document.getElementById("confirmBtn");
  if (prizePool.length === 0 && confirmBtn) {
    confirmBtn.remove();
  }
}

function checkRebuyConfirmButtonVisibility() {
  const rebuyConfirmBtn = document.getElementById("rebuyConfirmBtn");
  if (rebuyPool.length === 0 && rebuyConfirmBtn) {
    rebuyConfirmBtn.remove();
  }
}
 
function ensureRebuyConfirmBtn(rebuyPool) {
  let rebuyConfirmBtn = document.getElementById("rebuyConfirmBtn");
  if (!rebuyConfirmBtn && rebuyPool.length > 0) {
    rebuyConfirmBtn = document.createElement("button");
    rebuyConfirmBtn.id = "rebuyConfirmBtn";
    rebuyConfirmBtn.textContent = "Confirm";
    rebuyConfirmBtn.style.position = "fixed";
    rebuyConfirmBtn.style.bottom = "75px";
    rebuyConfirmBtn.style.right = "20px"; // left of cancel button
    rebuyConfirmBtn.style.padding = "10px 15px";
    rebuyConfirmBtn.style.backgroundColor = "green";
    rebuyConfirmBtn.style.color = "white";
    rebuyConfirmBtn.style.border = "none";
    rebuyConfirmBtn.style.cursor = "pointer";
    rebuyConfirmBtn.style.zIndex = 3001;

    rebuyConfirmBtn.addEventListener("click", () => {
      const rebuyAmount = parseInt(localStorage.getItem("Rebuy")) || 0;
      rebuyPool.forEach(idx => {
        players[idx].chips += rebuyAmount;
      });

      // Clean up UI
      document.getElementById("rebuyOverlay")?.remove();
      document.getElementById("rebuyCancelBtn")?.remove();
      rebuyConfirmBtn.remove();
      document.querySelectorAll(".player-select-btn").forEach(btn => btn.remove());

      // Re-render chips
      renderPlayers();
    });

    document.body.appendChild(rebuyConfirmBtn);
  }
}

// Initialize
renderPlayers();

if(gameMode == "Desktop") {
  document.body.classList.add("desktop"); 
} else {
  document.body.classList.add("tabletop-touch");
}

// After renderPlayers() call and winnerBtn declaration
const winnerBtn = document.getElementById("winnerBtn");
let prizePool = []; // stores selected winners' indices or names

// Rebuy button listener
const rebuyBtn = document.getElementById("rebuyBtn"); // your Rebuy button in HTML
let rebuyPool = [];

winnerBtn.addEventListener("click", () => {
    // Create overlay
    let overlay = document.createElement("div");
    overlay.id = "winnerOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(128,128,128,0.7)";
    overlay.style.zIndex = 2000;
    document.body.appendChild(overlay);
  
    // Create cancel button
    let cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelBtn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.position = "absolute";
    cancelBtn.style.bottom = "20px";
    cancelBtn.style.right = "20px";
    cancelBtn.style.padding = "10px 15px";
    cancelBtn.style.backgroundColor = "red";
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "none";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.style.zIndex = 3000;
    document.body.appendChild(cancelBtn);

    showPlayerWinnerSelectionButtons();
  
    cancelBtn.addEventListener("click", () => {
      // Remove overlay and cancel button
      overlay.remove();
      cancelBtn.remove();
      document.querySelectorAll(".player-select-btn").forEach(btn => btn.remove());

    });
});

rebuyBtn.addEventListener("click", () => {
    // Create overlay
    let overlay = document.createElement("div");
    overlay.id = "rebuyOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(128,128,128,0.7)";
    overlay.style.zIndex = 2000;
    document.body.appendChild(overlay);
  
    // Create cancel button
    let rebuyCancelBtn = document.createElement("button");
    rebuyCancelBtn.id = "rebuyCancelBtn";
    rebuyCancelBtn.textContent = "Cancel";
    rebuyCancelBtn.style.position = "absolute";
    rebuyCancelBtn.style.bottom = "75px";
    rebuyCancelBtn.style.right = "20px";
    rebuyCancelBtn.style.padding = "10px 15px";
    rebuyCancelBtn.style.backgroundColor = "red";
    rebuyCancelBtn.style.color = "white";
    rebuyCancelBtn.style.border = "none";
    rebuyCancelBtn.style.cursor = "pointer";
    rebuyCancelBtn.style.zIndex = 3000;
    document.body.appendChild(rebuyCancelBtn);

    showPlayerRebuySelectionButtons();
  
    rebuyCancelBtn.addEventListener("click", () => {
      // Remove overlay and cancel button
      overlay.remove();
      rebuyCancelBtn.remove();
      document.querySelectorAll(".player-select-btn").forEach(btn => btn.remove());

    });
});




