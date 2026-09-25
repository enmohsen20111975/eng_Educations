import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Engineer's Educations API",
    version: "1.0.0",
    endpoints: [
      "/api/sections",
      "/api/sections/:id",
      "/api/lessons",
      "/api/lessons/:id",
      "/api/questions",
      "/api/questions/:id",
      "/api/matrix",
      "/api/quiz/start",
      "/api/quiz/submit",
      "/api/attempts",
      "/api/progress",
      "/api/admin/seed",
    ],
  });
}
