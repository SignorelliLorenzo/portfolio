export type RGB = [number, number, number];

export interface Palette {
  id: string;
  label: string;
  accent: RGB;
  accentText: RGB;
  sidebarBg: string;
  sidebarFg: RGB;
  sidebarStrong: string;
  mainBg: string;
  mainFg: RGB;
  mainStrong: string;
}

export const PALETTES: Palette[] = [
  {
    id: "bronze",
    label: "Bronze",
    accent: [196, 154, 108],
    accentText: [196, 154, 108],
    sidebarBg: "#110f0c",
    sidebarFg: [255, 255, 255],
    sidebarStrong: "#ffffff",
    mainBg: "#161310",
    mainFg: [255, 255, 255],
    mainStrong: "rgba(255,255,255,0.95)",
  },
  {
    id: "daylight",
    label: "Daylight",
    accent: [13, 110, 102],
    accentText: [12, 74, 69],
    sidebarBg: "#eceff0",
    sidebarFg: [22, 28, 30],
    sidebarStrong: "#131819",
    mainBg: "#ffffff",
    mainFg: [22, 28, 30],
    mainStrong: "#131819",
  },
  {
    id: "midnight",
    label: "Midnight",
    accent: [122, 162, 247],
    accentText: [122, 162, 247],
    sidebarBg: "#0b1019",
    sidebarFg: [255, 255, 255],
    sidebarStrong: "#ffffff",
    mainBg: "#10151f",
    mainFg: [255, 255, 255],
    mainStrong: "rgba(255,255,255,0.95)",
  },
];

export const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export function getPalette(id: string | undefined): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}
