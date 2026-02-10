import { NextRequest, NextResponse } from "next/server";
import { fetchProjects } from "@/lib/projects";
import { isLocale, type Locale, defaultLocale } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  try {
    const localeParam = request.nextUrl.searchParams.get("locale") ?? defaultLocale;
    const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale;
    const projects = await fetchProjects(locale);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
