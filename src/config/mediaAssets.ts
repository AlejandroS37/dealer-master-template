/** Original uploaded filenames. Build-time derivatives preserve these names and pixels. */
export const mediaSources = {
  brand: "Level Up Auto Sales Supercar Nightscape.png",
  doorsOpen: "McLaren Wings in a Luxe Showroom.png",
  doorsClosed: "Midnight McLaren_ Skyline Showroom.png",
  burnout: "McLaren Burnout in a Neon Showroom.png",
  smoke: "Supercar Smoke in a Neon Garage.png",
  blackMarble: "Luxurious Black Gold Veined Marble.png",
  whiteMarble: "Luxury White Gold Veined Marble.png",
  video: "kling_20261007_VIDEO_Cinematic__2227_0.mp4",
};
export function mediaURL(source: string): string {
  return `/media/${encodeURIComponent(source.replace(/\.png$/i, ".webp"))}`;
}
export const mediaAssets = Object.fromEntries(
  Object.entries(mediaSources).map(([key, source]) => [key, mediaURL(source)]),
) as Record<keyof typeof mediaSources, string>;
