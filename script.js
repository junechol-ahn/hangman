const wrongLettesEl = document.getElementById('wrong-letters');
const playAgainBtn = document.getElementById('play-button');
const popup = document.getElementById('popup-container');
const notification = document.getElementById('notification-container');
const finalMessage = document.getElementById('final-message');
const wordEl = document.getElementById('word');

const figureParts = document.querySelectorAll('.figure-part');

let words = [];
let selectedWord = '';

function resetWord(minlength, maxlength) {
  // selectedWord = "hangman"
  // return

  if (words) {
    selectedWord = '';

    while (selectedWord.length < minlength || selectedWord.length > maxlength) {
      selectedWord = words[Math.floor(Math.random() * words.length)];
    }
  }
}

async function init() {
  const res = await fetch('hangman_words.txt');
  words = (await res.text()).trim().split(',');
  resetWord(6, 10);
  console.log(selectedWord);
  displayWord()
}

init();

const correctLetters = [];
const wrongLetters = [];

function getAnswerMessage() {
  return `정답: ${selectedWord}`
}

function restartGame() {
  correctLetters.length = 0
  wrongLetters.length = 0
  resetWord(6,10)
  updateWrongLettersEl()
  displayWord()
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
    finalMessage.innerText = `축하합니다! 승리했습니다! 😊\n${getAnswerMessage()}`
    popup.style.display = 'flex'
  }
}

function updateWrongLettersEl() {
  wrongLettesEl.innerHTML = `
    ${wrongLetters.length > 0 ? '<p>틀린 글자</p>': ''}
    ${wrongLetters.map(letter=>`<span>${letter}</span>`)}
  `

  figureParts.forEach((part, index)=>{
    const errors = wrongLetters.length

    if (index < errors) {
      part.style.display = 'block'
    } else {
      part.style.display = 'none'
    }
  })

  if (wrongLetters.length === figureParts.length) {
    finalMessage.innerText = `아쉽게도 졌습니다. 😭\n${getAnswerMessage()}`
    popup.style.display = 'flex'
  }
}

function showNotification() {
  notification.classList.add('show')

  setTimeout(()=>{
    notification.classList.remove('show')
  }, 2000)
}

playAgainBtn.addEventListener('click', ()=>{
  restartGame()
})


// 키보드 알파벳 입력 처리
window.addEventListener('keydown', e => {
  const isAlphabet = /^[a-z]$/i.test(e.key)
  if (!isAlphabet) return

  if (correctLetters.includes(e.key) 
    || wrongLetters.includes(e.key)) {
    console.log('이미 사용한 글자입니다')
    showNotification()
    return
  }

  if (selectedWord.includes(e.key)) {
    correctLetters.push(e.key)
  } else {
    wrongLetters.push(e.key)
    updateWrongLettersEl()
  }
  displayWord()
})
