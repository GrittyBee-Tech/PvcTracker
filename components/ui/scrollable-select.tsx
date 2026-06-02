import * as Select from "@radix-ui/react-select";

interface SelectOption {
  name: string;
  value: string;
}

interface SelectProps<T extends string> {
  id: string;
  options: SelectOption[];
  value: string;
  name: T; // The name must match the tracked key exactly
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  selectClassName?: string;
}

export const ScrollableSelect = <T extends string>({
  options,
  value,
  id,
  onValueChange,
  disabled,
  selectClassName,
  placeholder,
}: SelectProps<T>) => (
  <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
    <Select.Trigger
      id={id}
      className={`w-full mt-1.5 p-2.5 text-sm border outline-none rounded-lg text-primary border-zinc-700 bg-white focus:border-green-500 flex items-center justify-between ${selectClassName}`}
    >
      <Select.Value placeholder={placeholder || "Select an option..."} />
      <Select.Icon className="ml-2">▼</Select.Icon>
    </Select.Trigger>

    <Select.Portal>
      <Select.Content className="bg-white border border-zinc-300 rounded-md shadow-lg z-50">
        <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-zinc-700 cursor-default">
          ▲
        </Select.ScrollUpButton>

        <Select.Viewport className="h-[200px] overflow-y-auto p-2">
          {options.map(({ name, value }) => (
            <Select.Item
              value={value}
              key={value}
              className="relative flex items-center h-9 px-6 text-sm text-zinc-900 rounded-sm select-none data-[disabled]:text-zinc-400 data-[disabled]:pointer-events-none data-[highlighted]:bg-zinc-100 data-[highlighted]:outline-none cursor-pointer"
            >
              <Select.ItemText>{name}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>

        <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-zinc-700 cursor-default">
          ▼
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);
