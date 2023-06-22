import React, { ChangeEvent, SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { IconButton, Button, Loader } from "monday-ui-react-core"

import { Send } from 'monday-ui-react-core/icons';

import classes from './text-input-with-send.module.scss';

import { Modes } from '../../types/layout-modes';
import { isEnterWithControlKey } from '../../helpers/dom-events';

import {showErrorMessage} from '@/helpers/monday-actions'

const ERROR_TIMEOUT = 3000;

const isValidInput = (input: string): boolean => {
  return input.trim().length > 0;
};

type Props = {
  error?: string;
  mode: Modes;
  setMode(mode: Modes): void;

  /**
   * This method is called when the user presses send
   * @param userMessage Contents of the input text box
   */
  onSend(userMessage: string): void;
  initialInputValue?: string;
  loading: boolean;
  success: boolean;
  inputRows?: number;
};

const TextInputWithSend = ({
  error,
  mode,
  setMode,
  onSend,
  initialInputValue = '',
  loading,
  success,
}: Props): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>(initialInputValue);
  const [inputElHeight, setInputElHeight] = useState<number>();

  const canSendInput = !loading && isValidInput(inputValue);

  const content = useRef<HTMLTextAreaElement>(null);

  const focusInputContent = useCallback(() => {
    const textAreaElement = content?.current;
    if (!textAreaElement) {
      return;
    }
    textAreaElement.focus();
    textAreaElement.setSelectionRange(textAreaElement.value.length, textAreaElement.value.length);
  }, []);

  // BUG: make input become smaller when user deletes content
  const handleInputChange = useCallback((newValue: string) => {
    setInputElHeight(content.current?.scrollHeight);
    setInputValue(newValue);
  }, []);

  useEffect(() => {
    handleInputChange(inputValue);
    focusInputContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(event.currentTarget.value ?? '');
  };

  const resetInput = useCallback(() => {
    setInputValue('');
    setInputElHeight(undefined);
  }, [setInputValue, setInputElHeight]);

  const handleOnSend = useCallback(() => {
    if (canSendInput) {
      onSend(inputValue);
    }
  }, [canSendInput, inputValue, onSend]);

  const onKeyDown = useCallback(
    (event: SyntheticEvent<HTMLTextAreaElement, KeyboardEvent>) => {
      const shouldSubmit = isEnterWithControlKey(event.nativeEvent);

      if (shouldSubmit) {
        handleOnSend();
      }
    },
    [handleOnSend]
  );

  useEffect(() => {
    if (error && mode === Modes.response) {
      console.error('err:', error);
      showErrorMessage(`Something went wrong: ${error}`, ERROR_TIMEOUT);
      setMode(Modes.request);
    }
  }, [error, mode, setMode]);

  useEffect(() => {
    if (success) {
      resetInput();
    }
  }, [success, resetInput])

  return (
    <div className={classes.inputContainer}>
      <textarea
        className={classes.input}
        rows={1}
        ref={content}
        placeholder={'Write your prompt here...'}
        value={inputValue}
        onChange={onChange}
        onKeyDown={onKeyDown}
        style={{ height: inputElHeight ? `${inputElHeight}px` : 'auto' }}
      />
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
  );
};

export default TextInputWithSend;
