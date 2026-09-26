/** Real images (from web, hosted on ZAI OSS) for lesson visual headers.
 * Maps topic keywords → image URL. Non-SVG, real photos. */
export const LESSON_IMAGES: { match: string[]; url: string; alt: string }[] = [
  // Pump / bearing / maintenance
  { match: ["pump", "bearing", "mechanical", "maintenance", "seal", "lubrication", "vibration"], url: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f09f598e377e.jpg", alt: "Industrial pump maintenance and bearing reliability" },
  { match: ["planning", "scheduling", "work-management", "cmms", "work-order", "wrench"], url: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cf9ee6b2e8e9.jpg", alt: "Maintenance planning and scheduling" },
  { match: ["equipment", "reliability", "condition", "monitoring", "predictive"], url: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/564ec01f1a17.jpg", alt: "Equipment reliability and condition monitoring" },
  // OEE / manufacturing / quality
  { match: ["oee", "production", "manufacturing", "efficiency", "tpm", "quality"], url: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/376df2f993da.jpg", alt: "OEE and manufacturing efficiency dashboard" },
  { match: ["process", "design", "commissioning", "install"], url: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3ce0a1a7f782.png", alt: "Process design and manufacturing" },
  { match: ["six-sigma", "dmaic", "control", "spc", "defect", "improvement"], url: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fddde9d71b71.png", alt: "Six Sigma quality control and SPC" },
  // Electrical / circuits
  { match: ["electrical", "circuit", "electronics", "voltage", "current", "motor"], url: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ed6c907dc394.jpg", alt: "Electrical circuit and power engineering" },
  { match: ["digital", "logic", "binary", "boolean", "gate"], url: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0cf3793beb50.jpg", alt: "Digital logic and circuit design" },
  { match: ["control", "system", "pid", "transfer", "feedback"], url: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fcadc3a6d75e.jpg", alt: "Control systems engineering" },
];

/** Returns a matching image URL for a lesson based on slug + competency keywords. */
export function getLessonImage(slug: string, competencyName?: string): { url: string; alt: string } | null {
  const hay = `${slug} ${competencyName || ""}`.toLowerCase();
  for (const img of LESSON_IMAGES) {
    if (img.match.some((m) => hay.includes(m))) return img;
  }
  return null;
}
