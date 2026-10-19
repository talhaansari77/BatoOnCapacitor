// Visit preparation instructions per service category

export function getVisitPrepInstructions(serviceType) {
  const s = (serviceType || "").toLowerCase();

  const base = [
    "Arrive 10 minutes early.",
    "Bring any previous lab results or treatment records if available.",
    "Prepare any questions you want to ask.",
    "Follow any specific instructions sent by the BATO team.",
  ];

  if (s.includes("hair")) {
    return [
      ...base,
      "Avoid heavy styling products before your visit.",
      "Upload front, top, sides, and crown photos before you arrive if possible.",
      "Bring previous lab results or hair-related test results if available.",
    ];
  }
  if (s.includes("skin")) {
    return [
      ...base,
      "Note your current skincare routine and active ingredients.",
      "Tell the team if you use retinoids, acids, or strong actives.",
      "Mention any recent peel, laser, or reaction before your visit.",
    ];
  }
  if (s.includes("laser")) {
    return [
      ...base,
      "Avoid tanning or strong sun exposure before your visit.",
      "Do not wax the treatment area — shaving is preferred.",
      "Tell the team about any skin sensitivity or medication you are taking.",
    ];
  }
  if (s.includes("inject")) {
    return [
      ...base,
      "Tell the doctor about previous Botox, filler, or skin boosters.",
      "Mention any blood thinners, bruising tendency, or recent procedures.",
      "Explain clearly the result you are hoping for.",
    ];
  }
  if (s.includes("drip") || s.includes("iv")) {
    return [
      ...base,
      "Bring or upload previous lab results before your visit.",
      "Mention all allergies, medications, and supplements.",
      "Follow fasting instructions if the BATO team sends any.",
    ];
  }
  if (s.includes("panel") || s.includes("lab") || s.includes("blood") || s.includes("test")) {
    return [
      ...base,
      "Bring or upload any previous lab results.",
      "Mention current medications and supplements.",
      "Follow fasting instructions if the team requests them.",
    ];
  }

  return base;
}