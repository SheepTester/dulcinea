export function getInput({ storageKey, form, input, saveCheckbox }) {
  const localStorageValues = {
    token: localStorage.getItem(storageKey.token),
    port: localStorage.getItem(storageKey.port),
  };
  if (localStorageValues) {
    input.token.value = localStorageValues.token;
    input.port.value = localStorageValues.port;
    saveCheckbox.checked = true;
  }
  saveCheckbox.addEventListener('change', (e) => {
    if (saveCheckbox.checked) {
      localStorage.setItem(storageKey.token, input.token.value);
      localStorage.setItem(storageKey.port, input.port.value);
    } else {
      localStorage.removeItem(storageKey.token);
      localStorage.removeItem(storageKey.port);
    }
  });
  return new Promise((resolve) => {
    form.addEventListener(
      'submit',
      (e) => {
        if (saveCheckbox.checked) {
          localStorage.setItem(storageKey.token, input.token.value);
          localStorage.setItem(storageKey.port, input.port.value);
        }
        resolve({
          token: input.token.value,
          port: input.port.value,
        });
        e.preventDefault();
      },
      { once: true }
    );
  });
}
