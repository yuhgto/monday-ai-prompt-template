import dynamic from "next/dynamic";
import { Dropdown } from "monday-ui-react-core"

type DropdownSelection = {
  id: string;
  value: string;
}

type Props = {
  className?: string;
  columns: Record<string, any>[];
  onChange: (e:DropdownSelection) => void;
  placeholder?: string;
};

const SelectColumn = ({className, columns, onChange, placeholder}:Props): JSX.Element => {
  return (
    <Dropdown
    className={className}
    options={columns}
    onChange={onChange}
    placeholder={placeholder ?? "Select a column"}
    size="small"
    />
  );
};

export default SelectColumn;