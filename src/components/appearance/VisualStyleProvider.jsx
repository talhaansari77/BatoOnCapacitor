import React, {createContext, useContext, useEffect, useRef, useState, useCallback} from "react";
import {useTheme} from "next-themes";
import {useAuth} from "@/lib/AuthContext";
import {base44} from "@/api/base44Client";

export const STYLES = ["atelier", "prism", "contour"];
const APPEARANCES = ["system", "light", "dark"];
const Context = createContext(null);
const read = key => {try {return localStorage.getItem(key);} catch {return null;}};
const write = (key,value) => {try {localStorage.setItem(key,value);} catch {/* In-memory preferences remain available. */}};
const parse = value => {try {return JSON.parse(value);} catch {return null;}};
export default function VisualStyleProvider({children}) {
  const {user} = useAuth();
  const {theme = "system", setTheme} = useTheme();
  const [style,setStyle] = useState(() => STYLES.includes(read("bato_style")) ? read("bato_style") : "atelier");
  const [syncState,setSyncState] = useState("idle");
  const owner = user?.id || user?.email;
  const latest = useRef({style, appearance:theme});
  const hydrated = useRef(null);
  const queue = useRef(Promise.resolve());
  const revision = useRef(0);
  const ownerRef = useRef(owner);
  ownerRef.current = owner;
  const persistLocal = useCallback((value,dirty=false) => {
    write("bato_style",value.style);
    write("bato_theme",value.appearance);
    if(owner) write("bato_visual:"+owner,JSON.stringify({...value,dirty}));
  },[owner]);
  const apply = useCallback(value => {
    latest.current = value;
    setStyle(value.style);
    setTheme(value.appearance);
    document.documentElement.dataset.batoStyle = value.style;
  },[setTheme]);
  const sync = useCallback(async () => {
    if(!owner) return;
    const account = owner;
    const version = revision.current;
    const value = {...latest.current};
    setSyncState("saving");
    const task = queue.current.catch(()=>{}).then(async () => {
      if(ownerRef.current !== account) return;
      await base44.auth.updateMe({visual_style:value.style, appearance_mode:value.appearance});
      if(ownerRef.current === account && revision.current === version) {
        persistLocal(value,false);
        setSyncState("saved");
      }
    });
    queue.current = task;
    try {await task;} catch(error) {
      if(ownerRef.current === account && revision.current === version) setSyncState("error");
      throw error;
    }
  },[owner,persistLocal]);
  useEffect(() => {
    if(!owner || hydrated.current === owner) return;
    hydrated.current = owner;
    const cached = parse(read("bato_visual:"+owner));
    const value = {
      style: cached?.dirty && STYLES.includes(cached.style) ? cached.style : STYLES.includes(user.visual_style) ? user.visual_style : STYLES.includes(cached?.style) ? cached.style : "atelier",
      appearance: cached?.dirty && APPEARANCES.includes(cached.appearance) ? cached.appearance : APPEARANCES.includes(user.appearance_mode) ? user.appearance_mode : APPEARANCES.includes(cached?.appearance) ? cached.appearance : APPEARANCES.includes(read("bato_theme")) ? read("bato_theme") : "system"
    };
    apply(value);
    persistLocal(value,!!cached?.dirty);
    if(cached?.dirty) sync().catch(()=>{});
  },[owner,user,apply,persistLocal,sync]);
  useEffect(() => {document.documentElement.dataset.batoStyle=style;},[style]);
  const update = useCallback(patch => {
    revision.current++;
    const value = {...latest.current,...patch};
    apply(value);
    persistLocal(value,true);
    sync().catch(()=>{});
  },[apply,persistLocal,sync]);
  useEffect(() => {
    const onStorage = event => {
      if(event.key !== "bato_visual:"+owner || !event.newValue) return;
      const value=parse(event.newValue);
      if(STYLES.includes(value?.style) && APPEARANCES.includes(value?.appearance)) apply(value);
    };
    const retry = () => {if(parse(read("bato_visual:"+owner))?.dirty) sync().catch(()=>{});};
    window.addEventListener("storage",onStorage);
    window.addEventListener("online",retry);
    return () => {window.removeEventListener("storage",onStorage);window.removeEventListener("online",retry);};
  },[owner,apply,sync]);
  return <Context.Provider value={{style, setStyle:value=>{if(STYLES.includes(value))update({style:value});}, setAppearance:value=>{if(APPEARANCES.includes(value))update({appearance:value});}, syncState, retrySync:sync, flushPreferences:sync}}>{children}</Context.Provider>;
}
export const useVisualStyle = () => useContext(Context);
