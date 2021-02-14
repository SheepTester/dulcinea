export function wait (delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

export function shuffleInPlace (array) {
  for (let i = array.length; i > 0; i--) {
    const index = Math.floor(Math.random() * i)
    ;[array[i - 1], array[index]] = [array[index], array[i - 1]]
  }
  return array
}
