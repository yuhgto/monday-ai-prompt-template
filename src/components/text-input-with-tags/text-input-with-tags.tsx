import { Modes } from "@/types/layout-modes"
import dynamic from "next/dynamic";
import classes from "@/components/text-input-with-tags/text-input-with-tags.module.scss"
import "@yaireo/tagify/dist/tagify.css" // Tagify CSS
import { MixedTags } from "@yaireo/tagify/dist/react.tagify";
import { Send } from 'monday-ui-react-core/icons';
import { useEffect, useState, useCallback } from "react";
import { showErrorMessage } from "@/helpers/monday-actions";
import { IconButton, Button, Loader } from "monday-ui-react-core"


/**
 * Do not render this component until you have fetched the list of tags. 
 * The validTags property CANNOT BE UPDATED after initial render
 */
type Props = { //TODO: move component types into its own file
  onInvalidTag?(e:any): void;
  validTags: {
    id: string;
    value: string;
  }[];
  initialInput: string;
  onSend(inputValue: string): void;
  mode: Modes;
  setMode(mode: Modes): void;
  loading: boolean;
  success: boolean;
  error?: string;
  className?: string;
}

type TagifyDropDownPosition = "manual" | "text" | "input" | "all";

/**
 * This component does not support CMD+Enter to send the message
 * @param param0 
 * @returns 
 */

const TextInputWithTagsAndSend = ({
  onInvalidTag,
  validTags,
  initialInput,
  onSend,
  mode,
  setMode,
  loading, 
  success,
  error,
  className
}: Props): JSX.Element => {
  const [canRenderInput, setCanRenderInput] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(initialInput);

  const isValidInput = (input: string): boolean => {
    const ret = input.trim().length > 0;
    return ret;
  };

  // TODO: enable send the moment the person starts typing (do not wait for onChange event)
  const canSendInput = canRenderInput && isValidInput(inputValue);

  useEffect(() => {
    if (validTags.length > 0) {
      setCanRenderInput(true);
    }
  }, [validTags])

  useEffect(() => {
    if (error && mode === Modes.response) {
      console.error('err:', error);
      showErrorMessage(`Something went wrong: ${error}`, 3000);
      setMode(Modes.request);
    }
  }, [error, mode, setMode]);

  const handleOnSend = () => {
    if (canSendInput) {
      onSend(inputValue)
    }
  };

  const DEFAULT_SETTINGS = {
    pattern: /@/, // <- must define "patten" in mixed mode
    dropdown: {
      enabled: 1,
      position: "text" as TagifyDropDownPosition,
      searchBy: ['title'],
      maxItems: 5,
    },
    enforceWhitelist: true,
    editTags: false as false, // this property is typed as 'false' 
  }

  const handleChange = useCallback((e:{detail:any}) => {
    console.log('onchange event', e);
    const input = e.detail.value;
    setInputValue(input);
  }, [])

  

  return (
    <div className={className}>
    <div className={classes.inputContainer}>
      <div className={classes.tagsContainer}>
      {canRenderInput && 
      <MixedTags 
      className={classes.input}
      // @ts-ignore
        settings={{whitelist: validTags, ...DEFAULT_SETTINGS}} 
        onChange={handleChange}
        onInvalid={onInvalidTag}
        defaultValue={initialInput}
      />}
      </div>
      <div className={classes.loaderContainer}>
      {(mode===Modes.response) ? <Loader size={24}/> : null}
      </div>
      <IconButton
          ariaLabel="Send"
          className={classes.sendButton}
          size={'small'}
          kind={Button.kinds.PRIMARY}
          icon={Send}
          onClick={handleOnSend}
          wrapperClassName={classes.sendButtonWrapper}
          disabled={!canSendInput}
        />
    </div>
    </div>
  )
}

export default TextInputWithTagsAndSend;