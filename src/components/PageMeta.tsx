import { Helmet } from "react-helmet-async";

const SITE = "https://www.motokah.com";

// One line per page for its Google title, description and canonical link. Replaces the
// home page's defaults from index.html (those carry data-rh so Helmet swaps them, not duplicates).
export default function PageMeta({ title, description, path }: { title: string; description: string; path: string }) {
  const full = `${title} | Motokah`;
  return (
    <Helmet>
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${SITE}${path}`} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${SITE}${path}`} />
    </Helmet>
  );
}
