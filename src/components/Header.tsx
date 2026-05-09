import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IconMenu2, IconSun, IconMoon, IconUser, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

const categoryTabs = [
  { label: "Used Cars",   href: "/search" },
  { label: "New Cars",    href: "/search?condition=New" },
  { label: "Bikes",       href: "/search?vehicleType=bike" },
  { label: "Commercial",  href: "/search?vehicleType=commercial" },
  { label: "Dealers",     href: "/dealers" },
  { label: "Blog",        href: "/blog" },
];

const mobileLinks = [
  { label: "Used Cars",    href: "/search" },
  { label: "New Cars",     href: "/search?condition=New" },
  { label: "Bikes",        href: "/search?vehicleType=bike" },
  { label: "Commercial",   href: "/search?vehicleType=commercial" },
  { label: "Dealers",      href: "/dealers" },
  { label: "Compare",      href: "/compare" },
  { label: "Blog",         href: "/blog" },
  { label: "Wishlist",     href: "/wishlist" },
  { label: "Messages",     href: "/messages" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/search"
      ? location.pathname === "/search" && !location.search.includes("vehicleType") && !location.search.includes("condition=New")
      : location.pathname + location.search === href || location.pathname === href.split("?")[0] && location.search === `?${href.split("?")[1] ?? ""}`;

  return (
    <>
      <EmailVerificationBanner />

      {/* ── Main header bar ── */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border safe-top">
        <div className="flex items-center justify-between px-3 py-2.5 max-w-screen-xl mx-auto">

          {/* Logo */}
          <Link to="/" className="flex items-baseline gap-1.5 shrink-0">
            <span className="text-xl font-extrabold text-primary tracking-tight">Motokah</span>
            <span className="text-[10px] text-muted-foreground hidden sm:block">Tanzania</span>
          </Link>

          {/* Desktop category tabs — hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-0 mx-4 flex-1">
            {categoryTabs.map((tab) => (
              <Link
                key={tab.label}
                to={tab.href}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive(tab.href)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <IconSun size={17} /> : <IconMoon size={17} />}
            </button>

            <NotificationBell />

            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="hidden sm:inline-flex gap-1 text-[12px] h-8 px-2"
              >
                <IconUser size={15} /> Profile
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
                className="hidden sm:inline-flex text-[12px] h-8 px-2"
              >
                Sign In
              </Button>
            )}

            <Button
              size="sm"
              className="h-8 px-3 text-[12px] font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate("/sell")}
            >
              Post Ad
            </Button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {menuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
            </button>
          </div>
        </div>

        {/* ── Category tab strip — visible below lg breakpoint as scrollable row ── */}
        <div className="lg:hidden border-t border-border bg-card overflow-x-auto">
          <div className="flex gap-0 px-1">
            {categoryTabs.map((tab) => (
              <Link
                key={tab.label}
                to={tab.href}
                className={`flex-shrink-0 px-3.5 py-2 text-[12px] font-medium transition-colors relative whitespace-nowrap ${
                  isActive(tab.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {tab.label}
                {isActive(tab.href) && (
                  <span className="absolute bottom-0 left-1.5 right-1.5 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ── Mobile slide-down menu ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-0 right-0 w-72 h-full bg-card border-l border-border shadow-2xl pt-16 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-0.5 px-2 pb-6">
              {mobileLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-3 text-sm text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border my-2 mx-1" />
              <button
                onClick={() => { toggleTheme(); setMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-3 text-sm text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
              >
                {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              {user ? (
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full mt-1">My Profile</Button>
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full mt-1">Sign In</Button>
                </Link>
              )}
              <Link to="/sell" onClick={() => setMenuOpen(false)}>
                <Button className="w-full mt-1 bg-primary text-primary-foreground font-bold">Post Free Ad</Button>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
