import {useEffect} from "react";

// VisualViewport tracks the space left by a phone keyboard. Ignore pinch zoom
// so zooming never reflows the dialog or changes the customer's text size.
export default function useMobileViewport() {
  useEffect(() => {
    const root=document.documentElement;
    const viewport=window.visualViewport;
    let restingHeight=window.innerHeight;
    const sync=()=>{
      if(viewport&&viewport.scale>1.01)return;
      const height=viewport?.height||window.innerHeight;
      const editing=document.activeElement?.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]');
      if(!editing)restingHeight=window.innerHeight;
      root.toggleAttribute("data-bato-keyboard-open",!!editing&&height<restingHeight-120);
      root.toggleAttribute("data-bato-short-viewport",height<=560);
      root.style.setProperty("--bato-visual-height",`${height}px`);
      root.style.setProperty("--bato-visual-top",`${viewport?.offsetTop||0}px`);
    };
    sync();
    viewport?.addEventListener("resize",sync);
    viewport?.addEventListener("scroll",sync);
    window.addEventListener("resize",sync);
    document.addEventListener("focusin",sync);
    document.addEventListener("focusout",sync);
    return ()=>{
      viewport?.removeEventListener("resize",sync);
      viewport?.removeEventListener("scroll",sync);
      window.removeEventListener("resize",sync);
      document.removeEventListener("focusin",sync);
      document.removeEventListener("focusout",sync);
      root.removeAttribute("data-bato-keyboard-open");
      root.removeAttribute("data-bato-short-viewport");
      root.style.removeProperty("--bato-visual-height");
      root.style.removeProperty("--bato-visual-top");
    };
  },[]);
}
