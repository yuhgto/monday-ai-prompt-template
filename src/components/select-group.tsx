import dynamic from "next/dynamic";

const Dropdown = dynamic(
  () => import("monday-ui-react-core").then((mod) => mod.Dropdown),
  {
    ssr: false,
  }
);

type DropdownSelection = {
  id: string;
  value: string;
}

type Props = {
  className?: string;
  groups: Record<string, any>[];
  onChange: (e: DropdownSelection) => void;
};

const SelectGroup = ({className, groups, onChange}:Props): JSX.Element => {
  return (
    <Dropdown
    className={className}
    options={groups}
    onChange={onChange}
    placeholder="Select a group"
    size="small"
    />
  );
};

export default SelectGroup;