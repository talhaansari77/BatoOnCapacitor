import React from "react";
export default function BatoSectionIntro({title,description,action}) {
 return <div className="bato-section-intro">
   <div className="min-w-0"><h2 className="bato-section-title">{title}</h2>
   {description&&<p className="bato-section-description">{description}</p>}</div>
   {action&&<div className="shrink-0">{action}</div>}
 </div>;
}
