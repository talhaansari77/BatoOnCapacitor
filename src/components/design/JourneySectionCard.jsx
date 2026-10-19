import React,{useId,useState} from "react";
import {AnimatePresence,useReducedMotion} from "framer-motion";
import {motion} from "@/components/motion/BatoMotion";
import {ChevronDown} from "lucide-react";
import CareText from "@/components/CareText";
export default function JourneySectionCard({icon:Icon,title,subtitle,defaultOpen=false,accent=false,children}) {
 const [open,setOpen]=useState(defaultOpen);
 const id=useId(),reduced=useReducedMotion();
 return <section className="bato-journey-section" data-expanded={open ? "true" : "false"}>
  <h3><button type="button" id={id+"-heading"} aria-expanded={open} aria-controls={id+"-body"}
   onClick={()=>setOpen(value=>!value)} className="bato-section-toggle">
   <span aria-hidden="true" className={"bato-section-icon"+(accent?" bato-section-icon-accent":"")}><Icon className="w-4 h-4"/></span>
   <span className="min-w-0"><span className="bato-card-title block"><CareText value={title}/></span>
   {subtitle&&<span className="bato-section-description block"><CareText value={subtitle}/></span>}</span>
   <ChevronDown aria-hidden="true" className={"bato-section-chevron"+(open?" rotate-180":"")}/>
  </button></h3>
  <AnimatePresence initial={false}>{open&&<motion.div id={id+"-body"} role="region" aria-labelledby={id+"-heading"}
   initial={reduced?false:{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
   exit={reduced?{opacity:0}:{height:0,opacity:0}} transition={{duration:reduced?0:0.18}} className="overflow-hidden">
    <div className="bato-section-body">{children}</div>
   </motion.div>}</AnimatePresence>
 </section>;
}
