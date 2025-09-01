import { useEffect, useRef, useState } from 'react'
import flag from './assets/flag.png'
import bomb from './assets/bomb.png'
import explosion from './assets/explosion.png'

export default function SquareBoard({
  sqamount, boardsize, amount,
  onStartTimer, onStopTimer, onResetTimer,
  onRevealScoreHook,
  triangularMode,
  timerLoseSignal,
  safeRevealSignal
}) {
  const [bombcords, setBombcords] = useState([])
  const [flagged, setFlagged] = useState([])
  const [defused, setDefused] = useState([])
  const [checked, setChecked] = useState([])
  const [allsquares, setAllsquares] = useState([])
  const [moves, setMoves] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null)

  let rows = sqamount
  let collumns = rows
  let cells = []

  function toCoords(index, size) {
    const row = Math.floor(index / size)
    const col = index % size
    return `${row}-${col}`
  }

  function toIndex(coords, size) {
    let [row, col] = coords.split('-')
    let index = (JSON.parse(row) * size) + (JSON.parse(col))
    return index
  }

  function checkAdjacent(coords, size) {
    let adjacent = []
    let [rowStr, colStr] = coords.split('-')
    const row = Number(rowStr), col = Number(colStr)
    const index = toIndex(coords, size)

    if (!triangularMode) {
      if (row > 0) adjacent.push(index - size)
      if (row < size - 1) adjacent.push(index + size)
      if (col > 0) adjacent.push(index - 1)
      if (col < size - 1) adjacent.push(index + 1)
      if (row > 0 && col > 0) adjacent.push(index - size - 1)
      if (row < size - 1 && col > 0) adjacent.push(index + size - 1)
      if (row < size - 1 && col < size - 1) adjacent.push(index + size + 1)
      if (row > 0 && col < size - 1) adjacent.push(index - size + 1)
      return adjacent
    }

    const up = ((row + col) % 2 === 0)
    if (col > 0) adjacent.push(index - 1)
    if (col < size - 1) adjacent.push(index + 1)
    if (up) {
      if (row < size - 1) adjacent.push(index + size)
    } else {
      if (row > 0) adjacent.push(index - size)
    }
    return adjacent
  }

  function adjacentBombCount(coords, size, btn) {
    if (checked.includes(coords)) return
    checked.push(coords)
    let count = 0
    let adjacent = checkAdjacent(coords, size)

    for (let element of adjacent) {
      let crdnts = toCoords(element, size)
      if (bombcords.includes(crdnts)) {
        count++
      }
    }
    if (count === 0) {
      defused.push(coords)
      if (onRevealScoreHook) onRevealScoreHook(1)
      btn.style.opacity = "20%"
      for (let element of adjacent) {
        const square = document.getElementById(toCoords(element, boardsize))
        adjacentBombCount(toCoords(element, boardsize), size, square)
      }
    } else {
      defused.push(coords)
      if (onRevealScoreHook) onRevealScoreHook(1)
      try {
        btn.innerHTML = `${count}`
        btn.classList.remove('n1','n2','n3','n4','n5','n6','n7','n8')
        if (count >= 1 && count <= 8) btn.classList.add('n' + count)
      } catch {}
    }
    return count
  }

  function revealBombs(clickedbomb) {
    let squares = document.querySelectorAll('.cell')
    for (let mine of squares) {
      let bombcord = mine.id
      if (bombcords.includes(bombcord)) {
        mine.innerHTML = `<img src=${bomb} class="bomb"/>`
      }
    }
    if (clickedbomb) {
      console.log(`%cKABOOM`,"color:red")
      clickedbomb.classList.add('boom')
      clickedbomb.innerHTML = `<img src=${explosion} class="explosion"/>`
      setTimeout(() => {
        clickedbomb.innerHTML = `<img src=${bomb} class="bomb"/>`
        clickedbomb.classList.remove('boom')
        gameOver()
      }, 1500)
    }
  }

  function gameOver() {
    setModalType('lose')
    setModalOpen(true)
    if (onStopTimer) onStopTimer()
  }

  function firstMove(coords, btn) {
    let adjacent = checkAdjacent(coords, boardsize)
    let starters = []
    for (let element of adjacent) {
      let minecords = toCoords(element, boardsize)
      if (bombcords.includes(minecords)) {
        let bombindex = bombcords.indexOf(minecords)
        bombcords.splice(bombindex, 1)
        console.log(`%cremoved ${minecords} from bombs`,"color:red")
        let selectedCell
        let cellsamount = boardsize ** 2
        let repeat = 0
        let hasCommon
        starters.push(minecords)
        do {
          hasCommon = false
          if (repeat>0) {
            console.log(`%cTaken, trying another coordinate (${repeat})`,"color:red")
          }
          repeat++
          let randomIndex = Math.floor(Math.random() * cellsamount)
          console.log(`%cAdding new ${toCoords(randomIndex,boardsize)} to bombs as replacement`,"color:green")
          selectedCell = toCoords(randomIndex, boardsize)
          hasCommon = starters.includes(selectedCell)
          console.log(starters)
        } while (hasCommon)
        bombcords.push(selectedCell)
        console.log(bombcords)
        defused.push(minecords)
        if (onRevealScoreHook) onRevealScoreHook(1)
      }
    }
    if (bombcords.includes(coords)) {
      let bombindex = bombcords.indexOf(coords)
      bombcords.splice(bombindex, 1)
      console.log(`%cremoved ${coords} from bombs`,"color:red")
      let selectedCell
      let cellsamount = boardsize ** 2
      let repeat = 0
      do {
        if (repeat>0) {
          console.log(`%cTaken, trying another coordinate (${repeat})`,"color:red")
        }
        repeat++
        let randomIndex = Math.floor(Math.random() * cellsamount)
        console.log(`%cAdding new ${toCoords(randomIndex,boardsize)} to bombs as replacement`,"color:green")
        selectedCell = toCoords(randomIndex, boardsize)
      } while (bombcords.includes(selectedCell))
      bombcords.push(selectedCell)
      console.log(bombcords)
      console.log(btn.id)
      defused.push(coords)
      if (onRevealScoreHook) onRevealScoreHook(1)
      adjacentBombCount(coords, boardsize, btn)
    } else {
      console.log("%csafe","color:green")
      console.log(`%c${btn.id}`,"color:blue")
      defused.push(coords)
      if (onRevealScoreHook) onRevealScoreHook(1)
      adjacentBombCount(coords, boardsize, btn)
    }
  }

  function retry() {
    setModalType('win')
    setModalOpen(true)
    if (onStopTimer) onStopTimer()
  }

  function winCheck() {
    let nonbombs = allsquares.filter(item => !bombcords.includes(item))
    let win = nonbombs.every(item => defused.includes(item))
    if (win) retry()
  }

  function handleClick(clickRef, row, collumn) {
    let coords = `${row}-${collumn}`
    const btn = document.getElementById(coords)
    if (clickRef.button === 2) {
      clickRef.preventDefault()
      if (!defused.includes(coords)) {
        if (flagged.includes(coords)) {
          btn.innerHTML = `</>`
          let removeIndex = flagged.indexOf(coords)
          flagged.splice(removeIndex, 1)
          console.log(`%cUnflagged ${coords}`,"color:red")
        } else {
          btn.innerHTML = `<img src=${flag} class="flag"/>`
          flagged.push(coords)
          console.log(`%cflagged ${coords}`,"color:green")
        }
        console.log(`%cTotal flags (coords): ${flagged}`,"color:blue")
      } else {
        console.log("Unflaggable")
      }
    } else if (clickRef.button === 0) {
      if (!flagged.includes(coords)) {
        if (moves === 0) {
          if (onStartTimer) onStartTimer()
          setMoves(moves + 1)
          firstMove(coords, btn)
        } else {
          if (bombcords.includes(coords)) {
            revealBombs(btn)
          } else {
            console.log("%csafe","color:green")
            console.log(`%c${btn.id}`,"color:blue")
            defused.push(coords)
            if (onRevealScoreHook) onRevealScoreHook(1)
            adjacentBombCount(btn.id, boardsize, btn)
            winCheck()
          }
        }
      } else {
        console.log("Undefusable")
      }
    }
  }

  function restartBoard() {
    bombcords.length = 0
    flagged.length = 0
    defused.length = 0
    checked.length = 0
    allsquares.length = 0
    setMoves(0)
    const squares = document.querySelectorAll('.cell')
    for (let el of squares) {
      el.innerHTML = ''
      el.style.opacity = ''
      el.classList.remove('boom','n1','n2','n3','n4','n5','n6','n7','n8')
      allsquares.push(el.id)
    }
    const cellsamount = boardsize ** 2
    for (let i = 0; i < amount; i++) {
      let selectedCell
      let repeat = 0
      do {
        if(repeat > 0)
        {
          console.log(`Trying again (${repeat})`)
        }
        repeat++
        let randomIndex = Math.floor(Math.random() * cellsamount)
        selectedCell = toCoords(randomIndex, boardsize)
      } while (bombcords.includes(selectedCell))
      bombcords.push(selectedCell)
    }
    console.log("Bomb assignment complete")
    setModalOpen(false)
    setModalType(null)
    if (onResetTimer) onResetTimer()
  }

  const prevLoseRef = useRef(timerLoseSignal)
  useEffect(() => {
    if (timerLoseSignal !== prevLoseRef.current) {
      prevLoseRef.current = timerLoseSignal
      if (!modalOpen) gameOver()
    }
  }, [timerLoseSignal, modalOpen])

  const prevSafeRef = useRef(safeRevealSignal)
  useEffect(() => {
    if (safeRevealSignal !== prevSafeRef.current) {
      prevSafeRef.current = safeRevealSignal
      const candidates = allsquares.filter(id => !bombcords.includes(id) && !defused.includes(id) && !flagged.includes(id))
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)]
        const btn = document.getElementById(pick)
        defused.push(pick)
        if (onRevealScoreHook) onRevealScoreHook(1)
        adjacentBombCount(pick, boardsize, btn)
        winCheck()
      }
    }
  }, [safeRevealSignal])


  // Creating cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < collumns; c++) {
      let stringid = `${r}-${c}`
      const isUp = ((r + c) % 2 === 0)
      const classNames = ['cell']
      if (triangularMode) {
        classNames.push('tri', isUp ? 'up' : 'down')
      }
      cells.push(
        <button
          className={classNames.join(' ')}
          style={{ aspectRatio: "1/1" }}
          key={`${r},${c}`}
          onClick={(self) => handleClick(self, r, c)}
          onContextMenu={(e) => handleClick(e, r, c)}
          id={stringid}
        />
      )
    }
  }

  const didRun = useRef(false)
  if (amount > (boardsize ** 2)) {
    throw new Error('Bomb amount over available space')
  }

  // Bomb assignment
  useEffect(() => {
    if (didRun.current) return
    didRun.current = true
    bombcords.length = 0
    flagged.length = 0
    defused.length = 0
    checked.length = 0
    allsquares.length = 0
    setMoves(0)
    let squares = document.querySelectorAll('.cell')
    for (let element of squares) {
      allsquares.push(element.id)
    }
    for (let i = 0; i < amount; i++) {
      let selectedCell
      let cellsamount = boardsize ** 2
      let repeat = 0
      do {
        if(repeat > 0)
        {
          console.log(`%c${selectedCell} is taken, trying again (${repeat})`,"color:red")
        }
        repeat++
        let randomIndex = Math.floor(Math.random() * cellsamount)
        selectedCell = toCoords(randomIndex, boardsize)
        console.log(`%c${toCoords(randomIndex,boardsize)}`,"color:green")
      } while (bombcords.includes(selectedCell))
      bombcords.push(selectedCell)
      console.log(bombcords)
    }
    console.log("Bomb assignment complete")
  }, [amount, boardsize])

  return (
    <div
      className={`board-wrapper${triangularMode ? ' tri-mode' : ''}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${collumns},1fr)`,
        gridTemplateRows: `repeat(${rows},1fr)`,
        gap: "1px"
      }}
    >
      {cells}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>{modalType === 'win' ? 'You Win!' : 'Game Over'}</h2>
            <p>{modalType === 'win' ? 'Nice job clearing the board.' : 'You hit a mine.'}</p>
            <button className="modal-restart-btn" onClick={restartBoard}>
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
