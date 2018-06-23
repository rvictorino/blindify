const search_url = '/artist-search'
const token_url = '/token'
const track_url = '/track'

let field = document.getElementById('answer')
let autocompleteZone = document.querySelectorAll('[data-complete=answer]')[0]

let next = document.getElementById('next')

let progress = document.getElementById('progress')

let score = 0
let scoreEl = document.getElementById('score')
scoreEl.innerHTML = score

let actualAnswer = document.getElementById('actualAnswer')

let coolDown = false
let resetCoolDown = () => coolDown = false

let searchArtists = (text) => {
  if (coolDown)
    return

  emptyResultsList(autocompleteZone)

  if (answer.value.length < 3)
    return

  coolDown = true
  setTimeout(resetCoolDown, 500)

  fetch(search_url, {
      method: 'POST',
      body: JSON.stringify({
        search: text
      }),
      headers: {
        'content-type': 'application/json'
      }
    })
    .then((res) => res.json())
    .then((json) => {
      updateAutoCompleteZone(autocompleteZone, json)
    })
    .catch((err) => console.error(err))
}

let emptyResultsList = (zone) => {
  while (zone.firstChild) {
    zone.removeChild(zone.firstChild)
  }
}


let giveAnswer = (el) => {
  if (currentTrack.artists.reduce((a, b) => a || el.target.innerHTML == b, false)) {
    score++
  } else {
    score--
  }
  scoreEl.innerHTML = score
  emptyResultsList(autocompleteZone)
}

let updateAutoCompleteZone = (zone, list) => {
  // empty list, should not be necessary
  emptyResultsList(zone)

  // fill list
  list.forEach((el) => {
    let name = document.createTextNode(el.name)
    let li = document.createElement("li")
    li.appendChild(name)
    li.classList.add('item')
    li.addEventListener('click', giveAnswer)
    zone.appendChild(li)
  })
}



let getNextTrack = () => {

  return fetch(track_url, {
      headers: {
        'content-type': 'application/json'
      }
    })
    .then((res) => res.json())

}

let endDate = new Date()

let startTimer = () => {
  endDate = new Date()
  endDate.setSeconds(endDate.getSeconds() + 30)
}

let updateProgress = setInterval(() => {
  let now = new Date()
  let val = 30 - (endDate.getTime() - now.getTime()) / 1000
  if (val > progress.max) {
    revealAnswer()
    progress.value = 0
  }
  progress.value = val
}, 500)


let currentTrack
let clearAnswer = () => {
  actualAnswer.innerHTML = ''
}

let revealAnswer = () => {
  if (currentTrack)
    actualAnswer.innerHTML = currentTrack.artists.join(' & ') + ' - ' + currentTrack.title
}



answer.addEventListener('keyup', (ev) => {
  searchArtists(answer.value)
})

let audio = new Audio()
next.addEventListener('click', (ev) => {
  audio.pause()
  revealAnswer()

  getNextTrack()
    .then((track) => {
      currentTrack = track
      audio = new Audio(track.url)
      audio.play()
      startTimer()
      clearAnswer()
    })
})