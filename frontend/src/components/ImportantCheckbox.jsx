/**
 * ImportantCheckbox — checkbox for marking items as important.
 *
 * Props:
 *   checked   bool    Whether the checkbox is checked.
 *   onChange  func    Callback fired on change — receives the native event.
 *   label     string  Text label displayed beside the checkbox.
 *                     Defaults to "Marcar como importante".
 */
export const ImportantCheckbox = ({
  checked,
  onChange,
  label = 'Marcar como importante',
}) => {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="
          w-4 h-4 rounded
          accent-yellow-500
          cursor-pointer
        "
      />
      <span className="text-sm text-text-primary">
        {label}
      </span>
    </label>
  );
};

export default ImportantCheckbox;
