import { Link, useNavigate } from "react-router-dom";
import { IconMenu2, IconSun, IconMoon, IconUser } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

const navLinks = [
  { label: "Buy Cars", href: "/search" },
  { label: "Sell Your Car", href: "/sell" },
  { label: "Compare", href: "/compare" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
    <EmailVerificationBanner />
    <header className="sticky top-0 z-50 border-b-2 border-primary bg-card/95 backdrop-blur-md safe-top">
      <div className="container mx-auto flex items-center justify-between py-3">
        {/* Logo */}
        <Link to="/" className="flex flex-col">
          <span className="text-2xl font-extrabold text-primary tracking-tight">Motokah</span>
          <span className="text-[10px] text-muted-foreground hidden sm:block">Find Your Perfect Ride</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.href} className="px-3 py-2 text-sm text-secondary-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            {theme === "dark" ? <IconSun size={18} stroke={2.5} /> : <IconMoon size={18} stroke={2.5} />}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {user ? (
            <Button variant="outline" size="sm" onClick={() => navigate("/profile")} className="hidden sm:inline-flex border-border text-foreground hover:bg-secondary gap-1">
              <IconUser size={16} /> Profile
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="hidden sm:inline-flex border-border text-foreground hover:bg-secondary">
              Sign In
            </Button>
          )}
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" onClick={() => navigate("/sell")}>
            Post Ad
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <IconMenu2 size={22} stroke={2.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-surface-2 border-border flex flex-col overflow-hidden">
              <SheetTitle className="text-primary font-bold text-lg">Motokah</SheetTitle>
              <nav className="flex flex-col gap-1 mt-6 overflow-y-auto flex-1">
                {navLinks.map(link => (
                  <SheetClose asChild key={link.label}>
                    <Link to={link.href} className="px-3 py-3 text-sm text-secondary-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                {user && (
                  <>
                    <SheetClose asChild>
                      <Link to="/profile" className="px-3 py-3 text-sm text-secondary-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">My Profile</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/wishlist" className="px-3 py-3 text-sm text-secondary-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">Wishlist</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/messages" className="px-3 py-3 text-sm text-secondary-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">Messages</Link>
                    </SheetClose>
                  </>
                )}
                <hr className="border-border my-2" />
                <SheetClose asChild>
                  <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-3 text-sm text-secondary-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors">
                    {theme === "dark" ? <IconSun size={18} stroke={2.5} /> : <IconMoon size={18} stroke={2.5} />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>
                </SheetClose>
                {user ? null : (
                  <SheetClose asChild>
                    <Link to="/auth"><Button variant="outline" className="border-border text-foreground w-full">Sign In</Button></Link>
                  </SheetClose>
                )}
                <SheetClose asChild>
                  <Link to="/sell"><Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold w-full">Post Ad</Button></Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    </>
  );
}
