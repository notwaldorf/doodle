const STORAGE_KEY = '__✨doodle✨__'
const COLORS = [
  { name: 'black', hex: '#000000'},
  { name: 'red', hex: '#f44336'},
  { name: 'pink', hex: '#E91E63'},
  { name: 'purple', hex: '#9C27B0'},
  { name: 'deeppurple', hex: '#673AB7'},
  { name: 'indigo', hex: '#3F51B5'},
  { name: 'blue', hex: '#2196F3'},
  { name: 'lightblue', hex: '#03A9F4'},
  { name: 'cyan', hex: '#00BCD4'},
  { name: 'teal', hex: '#009688'},
  { name: 'green', hex: '#4CAF50'},
  { name: 'lightgreen', hex: '#8BC34A'},
  { name: 'lime', hex: '#CDDC39'},
  { name: 'yellow', hex: '#FFEB3B'},
  { name: 'amber', hex: '#FFC107'},
  { name: 'orange', hex: '#FF9800'},
  { name: 'deeporange', hex: '#FF5722'},
  { name: 'brown', hex: '#795548'},
  { name: 'grey', hex: '#9E9E9E'}
]
var activeColor = 0;

// Are there settings to load? Else put the defaults in.
if (localStorage[STORAGE_KEY]) {
  var options = JSON.parse(localStorage.getItem(STORAGE_KEY));
  decay.value = options.decay;
  pixelSize.value = options.pixelSize;
  cycle.value = options.cycle;
  updateDecay();
  updatePixelSize();
  updateCycle();
} else {
  updateLocalStorage();
}

window.onresize = function() {
  drawPreamble();
  redrawBoard();
};
window.onkeyup = dealWithKeyboardMash;

buttonSettings.addEventListener('click', toggleSettings);
buttonAbout.addEventListener('click', toggleWhat);

decay.addEventListener('input', updateDecay);
pixelSize.addEventListener('input', updatePixelSize);
cycle.addEventListener('input', updateCycle);

colorsContainer.addEventListener('click', function(event) {
  cycleColour(event.target.dataset.index);
});

// Ok, so. On mobile we simulate hover.
container.addEventListener('touchmove', function(event) {
  event.preventDefault();
  var touch = event.touches[0];
  var target = document.elementFromPoint(touch.clientX, touch.clientY);

  // If the target actually changes, activate it and fade out the old one.
  // Otherwise, we're just hovering inside the same target.
  if (target !== window.__previousTarget) {
    if (window.__previousTarget)
      window.__previousTarget.classList.remove('active');
    target.classList.add('active');
    window.__previousTarget = target;
  }
});

window.onresize();

function dealWithKeyboardMash(e) {
  var key = e.keyCode ? e.keyCode : e.which;
  if (key == 88) {  // x
    resetTraces();
  } else if (key == 67) {  // c
    cycleColour();
  } else if (key == 86) {  // v
    toggleSettings();
  }
}

function redrawBoard() {
  var size = parseInt(pixelSize.value);

  var offset =
      topSection.getBoundingClientRect().top +
      topSection.getBoundingClientRect().height;

   /* the 1px is for the border */
  var width = Math.floor((window.innerWidth) / (size + 1));
  var height = Math.floor((window.innerHeight - offset) / (size + 1));
  size = size + 'px';  // yuuuup.

  // Draw a grid of pixels.
  container.innerHTML = '';
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      var box = document.createElement('div');
      box.tabindex = 1;
      box.className = 'box ' + COLORS[activeColor].name;
      box.style.width = box.style.height = size;
      container.appendChild(box);
    }
    // Eh why not.
    container.appendChild(document.createElement('br'));
  }
  focusBoard();
}

// Lay out the "available colours" container.
function drawPreamble() {
  var totalWidth = window.innerWidth - buttonsContainer.getBoundingClientRect().width;
  var boxWidth = Math.floor(totalWidth / (COLORS.length)) + 'px';

  colorsContainer.innerHTML = '';
  for (var i = 0; i < COLORS.length; i++) {
    var box = document.createElement('div');
    box.style.backgroundColor = COLORS[i].hex;
    box.style.width = box.style.height = boxWidth;
    box.dataset.index = i;
    box.tabindex = 1;
    if (i == 0) {
      box.className = 'active';
    }
    colorsContainer.appendChild(box);
  }
}

// Trigger a repaint to reset the animations.
function resetTraces() {
  container.style.display = 'none';
  container.offsetHeight;
  container.style.display = 'block';
}

function cycleColour(value) {
  var all = container.querySelectorAll('.box');
  var colorBoxes = colorsContainer.querySelectorAll('div');
  var newOne = value || (parseInt(activeColor) + 1);

  // Highlight the next active colour.
  colorBoxes[activeColor].className = '';
  activeColor = (activeColor === COLORS.length - 1) ? 0 : newOne;
  colorBoxes[activeColor].className = 'active';

  // Apply it to all the pixels.
  for (var i = 0; i < all.length; i++) {
    all[i].className = 'box ' + COLORS[activeColor].name;
  }
}

function toggleSettings() {
  settings.hidden = !settings.hidden;
  redrawBoard();
}

function toggleWhat() {
  what.hidden = !what.hidden;
  redrawBoard();
}

function focusBoard() {
  container.focus();
}

function updateDecay() {
  decayDisplay.textContent = decay.value + 's';
  container.style.transitionDuration = decay.value + 's';
  focusBoard();
  updateLocalStorage();
}

function updatePixelSize() {
  redrawBoard();
  updateLocalStorage();
  pixelSizeDisplay.textContent = pixelSize.value + 'px';
}

function updateCycle() {
  updateLocalStorage();
  cycleDisplay.textContent = cycle.value + 's';
  if (cycle.value === 0) {
    stop();
  } else if (requestId == -1) {
    start();
  }
}

function updateLocalStorage() {
  var options = {
      'decay': decay.value,
      'pixelSize': pixelSize.value,
      'cycle': cycle.value
    };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}

var requestId = -1;
var animationStartTime = 0;

function animate() {
  setTimeout(function() {
    if (cycle.value == 0) {
      stop();
    } else {
      cycleColour();
      requestId = window.requestAnimationFrame(animate);
    }
  }, cycle.value * 1000);
}
function start() {
  requestId = window.requestAnimationFrame(animate);
}
function stop() {
  if (requestId !== 1)
    window.cancelAnimationFrame(requestId);
  requestId = -1;
}
