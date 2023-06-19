import {VibeComponent} from "monday-ui-react-core/dist/types/types";
import {SIZES} from "monday-ui-react-core/dist/types/constants";
import {
  ButtonColor,
  ButtonInputType,
  ButtonType
} from "monday-ui-react-core/dist/types/components/Button/ButtonConstants";
import {ButtonProps} from "monday-ui-react-core/dist/types/components/Button/Button";

declare module "*.scss";

declare module "monday-ui-react-core/icons" {
  export const Send: any;
  export const Duplicate: any;
}

declare module "monday-ui-react-core" {
  interface Button {
    sizes?: typeof SIZES;
    colors?: typeof ButtonColor;
    kinds?: typeof ButtonType;
    types?: typeof ButtonInputType;
    inputTags?: typeof ButtonInputType;
  };

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
