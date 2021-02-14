const { createElement: e, useEffect, useState } = React

export function Timer ({ endTime, ...props }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const initSeconds = Math.floor((endTime - startTime) / 1000)
    setSeconds(initSeconds + 1)
    let intervalId = setTimeout(() => {
      setSeconds(initSeconds)
      intervalId = setInterval(() => {
        setSeconds(seconds => Math.max(seconds - 1, 0))
        if (Date.now() >= endTime) {
          clearInterval(intervalId)
        }
      }, 1000)
    }, (endTime - startTime) % 1000)
    return () => {
      clearInterval(intervalId)
    }
  }, [endTime])

  return e('span', { className: 'timer', ...props }, seconds)
}
