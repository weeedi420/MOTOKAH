import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { IconCalendar, IconArrowLeft } from "@tabler/icons-react";
import { format } from "date-fns";

type BlogPostData = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  created_at: string;
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  usePageTitle(post?.title || "Blog Post");

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("id, title, slug, content, cover_image, created_at")
      .eq("slug", slug)
      .eq("published", true)
      .single()
      .then(({ data }) => {
        setPost(data as BlogPostData | null);
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <IconArrowLeft size={16} /> Back to Blog
        </Link>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        ) : !post ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">Post not found</p>
          </div>
        ) : (
          <article>
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
            )}
            <h1 className="text-3xl font-bold text-foreground mb-3">{post.title}</h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
              <IconCalendar size={14} />
              {format(new Date(post.created_at), "MMMM d, yyyy")}
            </div>

            {/* Markdown rendered content */}
            <div className="prose prose-sm dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-p:text-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-muted prose-pre:rounded-xl
              prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
              prose-img:rounded-xl prose-img:my-4
              prose-ul:text-foreground prose-ol:text-foreground
              prose-li:text-foreground">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </article>
        )}
      </div>
      <Footer />
    </div>
  );
}
