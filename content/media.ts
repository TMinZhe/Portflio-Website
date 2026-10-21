import type { PortfolioMedia } from "./types";

/*
 * Path helpers so media entries only name the file. Put files in:
 *   public/images/projects/<project-slug>/
 *   public/images/experience/<experience-slug>/
 *   public/images/about/
 * See public/images/README.md for sizes, naming and the approval rule.
 */

type MediaMeta = Omit<PortfolioMedia, "src" | "type" | "id"> & { id?: string; type?: PortfolioMedia["type"] };

const make = (dir: string, file: string, meta: MediaMeta): PortfolioMedia => ({
  id: meta.id ?? file.replace(/\.[a-z0-9]+$/i, ""),
  type: meta.type ?? (/\.(mp4|webm)$/i.test(file) ? "video" : "image"),
  src: `/images/${dir}/${file}`,
  ...meta,
});

export const projectImage = (slug: string, file: string, meta: MediaMeta) => make(`projects/${slug}`, file, meta);
export const experienceImage = (slug: string, file: string, meta: MediaMeta) => make(`experience/${slug}`, file, meta);
export const aboutImage = (file: string, meta: MediaMeta) => make("about", file, meta);
