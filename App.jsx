import { useEffect, useState } from 'react'
import './App.css'
import SquareBoard from './SquareBoard'

function App() {
  const [resetKey, setResetKey] = useState(0)
  const [boardsize, setBoardSize] = useState(10)
  const [bombamount, setBombAmount] = useState(20)
  const [inputboardsize, setInputBoardSize] = useState(boardsize)
  const [inputbombamount, setInputBombAmount] = useState(bombamount)

  if (inputboardsize > 23) {
    setInputBoardSize(23)
  }
  if (inputbombamount > (inputboardsize ** 2) / 2) {
    setInputBombAmount(Math.floor((inputboardsize ** 2) / 2))
  }

  const [modeTriangular, setModeTriangular] = useState(false)
  const [modeScoreCombo, setModeScoreCombo] = useState(false)
  const [modeTimerPressure, setModeTimerPressure] = useState(false)
  const [pressureLimit, setPressureLimit] = useState(60)

  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [pressureLeft, setPressureLeft] = useState(pressureLimit)
  const [timerLoseSignal, setTimerLoseSignal] = useState(0)

  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [lastRevealAt, setLastRevealAt] = useState(null)

  const [safeRevealUsed, setSafeRevealUsed] = useState(false)
  const [safeRevealSignal, setSafeRevealSignal] = useState(0)

  useEffect(() => {
    if (!running || modeTimerPressure) return
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running, modeTimerPressure])

  useEffect(() => {
    if (!running || !modeTimerPressure) return
    setPressureLeft(pressureLimit)
  }, [resetKey, modeTimerPressure, pressureLimit, running])

  useEffect(() => {
    if (!running || !modeTimerPressure) return
    const id = setInterval(() => {
      setPressureLeft(p => {
        if (p <= 1) {
          clearInterval(id)
          setRunning(false)
          setTimerLoseSignal(x => x + 1)
          return 0
        }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, modeTimerPressure])

  function reset() {
    setResetKey(prev => prev + 1)
    setBoardSize(Number(inputboardsize))
    setBombAmount(Number(inputbombamount))
    setSeconds(0)
    setPressureLeft(pressureLimit)
    setRunning(false)
    setScore(0)
    setCombo(0)
    setLastRevealAt(null)
    setSafeRevealUsed(false)
  }

  function setPreset(sizeValue, mineCount) {
    setInputBoardSize(sizeValue)
    setInputBombAmount(mineCount)
  }

  function onStartTimer() {
    setSeconds(0)
    setRunning(true)
    if (modeTimerPressure) setPressureLeft(pressureLimit)
  }
  function onStopTimer() {
    setRunning(false)
  }
  function onResetTimer() {
    setSeconds(0)
    setRunning(false)
    setPressureLeft(pressureLimit)
  }

  function onRevealScoreHook() {
    if (!modeScoreCombo) return
    const now = Date.now()
    if (lastRevealAt && now - lastRevealAt <= 2000) {
      const newCombo = combo + 1
      setCombo(newCombo)
      setScore(s => s + 10 * newCombo)
    } else {
      setCombo(1)
      setScore(s => s + 10)
    }
    setLastRevealAt(now)
  }

  function triggerSafeReveal() {
    if (safeRevealUsed) return
    setSafeRevealUsed(true)
    setSafeRevealSignal(n => n + 1)
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const pm = String(Math.floor(pressureLeft / 60)).padStart(2, '0')
  const ps = String(pressureLeft % 60).padStart(2, '0')

  return (
    <>
      <div className="title">
        <p>MINESWEEPER</p>
      </div>
      <div className="parent">
        <div className="middle">
          <SquareBoard
            key={resetKey}
            amount={bombamount}
            sqamount={boardsize}
            boardsize={boardsize}
            onStartTimer={onStartTimer}
            onStopTimer={onStopTimer}
            onResetTimer={onResetTimer}
            onRevealScoreHook={onRevealScoreHook}
            triangularMode={modeTriangular}
            timerLoseSignal={timerLoseSignal}
            safeRevealSignal={safeRevealSignal}
          />
        </div>
        <div className="top">
          <button onClick={reset}>Reset</button>
          <div className="field">
            <span>Board size</span>
            <input
              type="number"
              value={inputboardsize}
              onChange={(event) => setInputBoardSize(event.target.value)}
            />
          </div>
          <div className="field">
            <span>Mines</span>
            <input
              type="number"
              value={inputbombamount}
              onChange={(event) => setInputBombAmount(event.target.value)}
            />
          </div>
          <div className="presets">
            <button onClick={() => setPreset(8, 10)}>Easy</button>
            <button onClick={() => setPreset(12, 24)}>Medium</button>
            <button onClick={() => setPreset(16, 40)}>Hard</button>
            <button onClick={() => setPreset(23, Math.floor((23 ** 2) / 2))}>Insane</button>
          </div>
          <div className="modes">
            <label><input type="checkbox" checked={modeTriangular} onChange={e => setModeTriangular(e.target.checked)} /> Triangular</label>
            <label><input type="checkbox" checked={modeScoreCombo} onChange={e => setModeScoreCombo(e.target.checked)} /> Score Combo</label>
            <label><input type="checkbox" checked={modeTimerPressure} onChange={e => setModeTimerPressure(e.target.checked)} /> Timer Pressure</label>
            {modeTimerPressure && (
              <div className="field">
                <span>Limit</span>
                <input type="number" value={pressureLimit} onChange={e => setPressureLimit(Number(e.target.value) || 0)} />
              </div>
            )}
          </div>
          <div className="timer">
            <span>Time</span>
            <span className="time">{modeTimerPressure ? `${pm}:${ps}` : `${mm}:${ss}`}</span>
          </div>
          <div className="score">
            <span>Score</span>
            <span className="scoreval">{score}</span>
          </div>
          <button className="item" onClick={triggerSafeReveal} disabled={safeRevealUsed}>
            Safe Reveal {safeRevealUsed ? '✓' : ''}
          </button>
        </div>
      </div>
    </>
  )
}

export default App
