const { createElement: e } = React

export function Checkbox ({ checked, onChange, disabled }) {
  return e(
    'div',
    { className: `checkbox-wrapper ${checked ? 'checkbox-checked' : ''} ${disabled ? 'checkbox-disabled' : ''}` },
    e('input', {
      type: 'checkbox',
      className: 'checkbox',
      checked,
      onChange: e => {
        onChange(e.target.checked)
      },
      disabled
    }),
    e('span', { className: 'material-icons' }, checked ? 'check_box' : 'check_box_outline_blank')
  )
}
