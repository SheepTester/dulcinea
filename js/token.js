export function getToken ({ storageKey, form, input, saveCheckbox }) {
  const localStorageValue = localStorage.getItem(storageKey)
  if (localStorageValue) {
    input.value = localStorageValue
    saveCheckbox.checked = true
  }
  saveCheckbox.addEventListener('change', e => {
    if (saveCheckbox.checked) {
      localStorage.setItem(storageKey, input.value)
    } else {
      localStorage.removeItem(storageKey)
    }
  })
  return new Promise(resolve => {
    form.addEventListener('submit', e => {
      if (saveCheckbox.checked) {
        localStorage.setItem(storageKey, input.value)
      }
      resolve(input.value)
      e.preventDefault()
    }, { once: true })
  })
}
