// Return writes a new line on a phone. Desktop Enter sends; Shift+Enter and
// composition confirmation always keep writing, including Arabic IME input.
export function shouldSendOnEnter(event, desktopKeyboard) {
  return desktopKeyboard && event.key==="Enter" && !event.shiftKey &&
    !event.isComposing && event.keyCode!==229;
}
