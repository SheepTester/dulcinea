export function wait (delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}
