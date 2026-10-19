// Preserve reading position when older messages arrive. New incoming messages
// move the list only when the customer was already at its end.
export function messageScrollTop({initial,newestChanged,olderAdded,nearBottom,top,previousHeight,height,clientHeight}) {
  if(olderAdded&&!newestChanged)return Math.max(0,top+height-previousHeight);
  if(initial||(newestChanged&&nearBottom))return Math.max(0,height-clientHeight);
  return top;
}
