declare module "*.scss";

declare module "monday-ui-react-core/icons" {
  export const Send: any;
  export const Duplicate: any;
}

declare module "monday-ui-react-core" {
  interface IconButtonProps {
    size: string;
    kind: string;
    ariaLabel?: string;
    className?: string;
    icon?: any;
    onClick?: () => void;
    wrapperClassName?: string;
    disabled?: boolean;
  };
  interface DropdownProps {
    options: Record;
    placeholder: string;
    dropdownMenuWrapperClassName?: string;
    className?: string;
    closeMenuOnSelect?: boolean;
    size?: string;
    insideOverflowContainer?: boolean;
    value?: any;
    onChange?: function;
    }
  interface LoaderProps {
    size: number;
    className?: string;
    wrapperClassName?: string;
  }
  interface SkeletonProps {
    type: string;
  }
  class Dropdown extends React.Component<DropdownProps, any> {}
  class Loader extends React.Component<LoaderProps, any> {
    sizes: any;
  }
  class Skeleton extends React.Component<SkeletonProps, any> { }
  class IconButton extends React.Component<IconButtonProps, any> { }
}
