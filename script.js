const wrongLettesEl = document.getElementById('wrong-letters');
const playAgainBtn = document.getElementById('play-button');
const popup = document.getElementById('popup-container');
const finalMessage = document.getElementById('final-message');
const wordEl = document.getElementById('word');
const keyboardEl = document.getElementById('keyboard');
const levelSelectEl = document.getElementById('level-select');

const figureParts = document.querySelectorAll('.figure-part');
const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const levelFiles = {
  1: 'level_1.txt',
  2: 'level_2.txt',
  3: 'level_3.txt',
  4: 'level_4.txt',
};

let words = [];
let selectedWord = '';
const correctLetters = [];
const wrongLetters = [];

function resetWord() {
  // selectedWord = "hangman"
  // return

  if (words.length > 0) {
    selectedWord = words[Math.floor(Math.random() * words.length)];
  }
}

function getBonusChances(word) {
  if (word.length === 4) return 2;
  if (word.length === 5) return 2;
  if (word.length === 6) return 1;
  return 0;
}

function getMaxWrongGuesses() {
  return figureParts.length + getBonusChances(selectedWord);
}

function getRemainingChances() {
  return Math.max(getMaxWrongGuesses() - wrongLetters.length, 0);
}

async function loadLevelWords(level) {
  const fileName = levelFiles[level] || levelFiles[1];
  const res = await fetch(fileName);

  if (!res.ok) {
    throw new Error(`${fileName} 파일을 불러오지 못했습니다.`);
  }

  words = (await res.text())
    .trim()
    .split(',')
    .map(word => word.trim())
    .filter(Boolean);
}

async function startLevel(level = levelSelectEl.value) {
  levelSelectEl.disabled = true;

  try {
    await loadLevelWords(level);
    restartGame();
  } catch (error) {
    console.error(error);
    selectedWord = '';
    wordEl.textContent = '단어를 불러오지 못했습니다.';
  } finally {
    levelSelectEl.disabled = false;
  }
}

function init() {
  renderKeyboard();
  const savedLevel = localStorage.getItem('selectedLevel');
  if (savedLevel) {
    levelSelectEl.value = savedLevel;
  }
  startLevel();
}

function getDictionaryUrl(word) {
  return `https://en.dict.naver.com/#/search?query=${encodeURIComponent(word)}`
}

function showFinalMessage(message) {
  const answerLink = document.createElement('a')
  answerLink.className = 'answer-link'
  answerLink.href = getDictionaryUrl(selectedWord)
  answerLink.target = '_blank'
  answerLink.rel = 'noopener noreferrer'
  answerLink.textContent = selectedWord

  finalMessage.replaceChildren(
    message,
    document.createElement('br'),
    '정답: ',
    answerLink
  )
}

function restartGame() {
  correctLetters.length = 0
  wrongLetters.length = 0
  resetWord()
  updateWrongLettersEl()
  displayWord()
  updateKeyboardButtons()
  popup.style.display = 'none'
}

function displayWord() {
  wordEl.innerHTML = `
  ${selectedWord.split('').map(letter=>`
    <span class='letter'>
      ${correctLetters.includes(letter) ? letter : ""}
    </span>`
  ).join('')}`;

  const innerWord = wordEl.innerText.replaceAll("\n", '')
  console.log(innerWord)

  if (innerWord === selectedWord) {
    showFinalMessage('축하합니다! 승리했습니다! 😊')
    popup.style.display = 'flex'
  }
}

function updateWrongLettersEl() {
  const remainingChances = getRemainingChances()

  wrongLettesEl.innerHTML = `
    <p class="chance-count">남은 기회: ${remainingChances}</p>
    ${wrongLetters.length > 0 ? '<p>틀린 글자</p>': ''}
    <div class="wrong-letter-list">
      ${wrongLetters.map(letter=>`<span>${letter}</span>`).join('')}
    </div>
  `

  figureParts.forEach((part, index)=>{
    const bonus = getBonusChances(selectedWord);
    const errorsToDraw = wrongLetters.length - bonus;

    if (index < errorsToDraw) {
      part.style.display = 'block'
    } else {
      part.style.display = 'none'
    }
  })

  if (wrongLetters.length >= getMaxWrongGuesses()) {
    showFinalMessage('아쉽게도 졌습니다. 😭')
    popup.style.display = 'flex'
  }
}

playAgainBtn.addEventListener('click', ()=>{
  restartGame()
})

levelSelectEl.addEventListener('change', () => {
  const level = levelSelectEl.value;
  localStorage.setItem('selectedLevel', level);
  startLevel(level);
})

keyboardEl.addEventListener('click', e => {
  if (!e.target.classList.contains('keyboard-key')) return
  handleLetter(e.target.dataset.letter)
})

function handleLetter(letter) {
  const normalizedLetter = letter.toLowerCase()
  const isAlphabet = /^[a-z]$/.test(normalizedLetter)
  if (!isAlphabet) return
  if (!selectedWord || popup.style.display === 'flex') return

  if (correctLetters.includes(normalizedLetter) 
    || wrongLetters.includes(normalizedLetter)) {
    return
  }

  if (selectedWord.includes(normalizedLetter)) {
    correctLetters.push(normalizedLetter)
  } else {
    wrongLetters.push(normalizedLetter)
    updateWrongLettersEl()
  }
  displayWord()
  updateKeyboardButtons()
}

function renderKeyboard() {
  keyboardEl.innerHTML = keyboardRows.map(row => `
    <div class="keyboard-row">
      ${row.split('').map(letter => `
        <button class="keyboard-key" type="button" data-letter="${letter}" aria-label="${letter}">
          ${letter}
        </button>
      `).join('')}
    </div>
  `).join('')
}

function updateKeyboardButtons() {
  keyboardEl.querySelectorAll('.keyboard-key').forEach(button => {
    const letter = button.dataset.letter
    const isCorrect = correctLetters.includes(letter)
    const isWrong = wrongLetters.includes(letter)

    button.disabled = isCorrect || isWrong
    button.classList.toggle('correct', isCorrect)
    button.classList.toggle('wrong', isWrong)
  })
}

// 키보드 알파벳 입력 처리
window.addEventListener('keydown', e => {
  handleLetter(e.key)
})

init();
