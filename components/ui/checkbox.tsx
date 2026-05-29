interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  name?: string;
  id?: string;
  className?: string;
}

const Checkbox = ({
  checked,
  onChange,
  label,
  name,
  id = "checkbox",
  className,
}: CheckboxProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
      />

      <label htmlFor={id} className="text-sm text-primary">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
