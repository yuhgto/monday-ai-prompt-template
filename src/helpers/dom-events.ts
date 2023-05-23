enum EventKey {
  ENTER = 'Enter',
}

const isClickWithControlKey = (event: KeyboardEvent): boolean => {
  return event?.metaKey || event?.ctrlKey;
};

export const isEnterWithControlKey = (event: KeyboardEvent): boolean => {
  return event?.key === EventKey.ENTER && isClickWithControlKey(event);
};
