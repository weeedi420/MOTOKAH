import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  created_at: string;
}

export default function LatestNewsSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => { if (data) setPosts(data); });
  }, []);

  if (posts.length === 0) return null;

  const [featured, ...rest] = posts;

  return (
    <section className="px-3 py-5">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-base font-bold text-foreground">Latest Car News</h2>
        <button
          onClick={() => navigate("/blog")}
          className="text-xs text-primary font-medium hover:underline"
        >
          View All →
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Featured post */}
        <button
          onClick={() => navigate(`/blog/${featured.slug}`)}
          className="w-full rounded-xl overflow-hidden border border-border bg-card text-left
            hover:border-primary transition-colors active:scale-[0.99]"
        >
          {featured.cover_image && (
            <div className="aspect-[16/7] overflow-hidden">
              <img
                src={featured.cover_image}
                alt={featured.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-3">
            <p className="text-[10px] text-primary font-semibold uppercase tracking-wide mb-1">
              Featured
            </p>
            <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
              {featured.title}
            </h3>
            {featured.excerpt && (
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                {featured.excerpt}
              </p>
            )}
          </div>
        </button>

        {/* Smaller posts */}
        <div className="flex flex-col gap-2">
          {rest.map((post) => (
            <button
              key={post.id}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="flex items-start gap-3 p-2.5 rounded-xl border border-border bg-card text-left
                hover:border-primary transition-colors active:scale-[0.99]"
            >
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-16 h-14 rounded-lg object-cover flex-shrink-0"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-[12px] font-semibold text-foreground line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
