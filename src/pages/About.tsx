import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";
import { IconCar, IconUsers, IconShieldCheck, IconMapPin, IconTargetArrow, IconEye, IconHeart, IconStar } from "@tabler/icons-react";

const stats = [
  { label: "Listings", value: "500+", icon: IconCar },
  { label: "Happy Buyers", value: "1,200+", icon: IconUsers },
  { label: "Verified Sellers", value: "300+", icon: IconShieldCheck },
  { label: "Cities Covered", value: "15+", icon: IconMapPin },
];

const values = [
  { icon: IconTargetArrow, title: "Our Mission", text: "To create the most trusted and user-friendly car marketplace in Africa, starting with Tanzania." },
  { icon: IconEye, title: "Our Vision", text: "A world where buying and selling a car is as simple, safe, and transparent as online shopping." },
  { icon: IconHeart, title: "Our Values", text: "Trust, transparency, simplicity, and putting our users first in every decision we make." },
];

const team = [
  { name: "Ahmed Hassan", role: "Founder & CEO", bio: "Car enthusiast with 10+ years in automotive tech." },
  { name: "Fatima Mwangi", role: "Head of Operations", bio: "Expert in logistics and marketplace operations across East Africa." },
  { name: "David Kimaro", role: "Lead Engineer", bio: "Full-stack developer passionate about building great products." },
  { name: "Amina Said", role: "Customer Success", bio: "Dedicated to ensuring every buyer and seller has a great experience." },
];

export default function About() {
  usePageTitle("About Us");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">About Motokah</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Tanzania's premier online automotive marketplace, connecting buyers and sellers across East Africa.
            Whether you're looking for a brand new car, a reliable used vehicle, or looking to sell your ride — Motokah makes it easy, safe, and fast.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <s.icon size={24} className="text-primary" />
                </div>
                <p className="text-3xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <v.icon size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Our Story</h2>
          <div className="prose prose-sm text-muted-foreground space-y-4 mx-auto">
            <p>Motokah was born from a simple frustration: buying and selling cars in Tanzania was too complicated, risky, and time-consuming. Scattered listings across social media, no way to verify sellers, and zero transparency in pricing.</p>
            <p>We set out to build something better — a dedicated platform where every listing is verified, every seller is accountable, and every buyer can make informed decisions. From our first 50 listings in Dar es Salaam, we've grown to cover cities across the country.</p>
            <p>Today, Motokah is more than a marketplace. It's a community of car enthusiasts, dealers, and everyday people looking for their perfect ride. And we're just getting started.</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Meet Our Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((m) => (
              <div key={m.name} className="bg-card border border-border rounded-xl p-5 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconUsers size={24} className="text-primary" />
                </div>
                <h4 className="font-bold text-foreground">{m.name}</h4>
                <p className="text-xs text-primary font-semibold mb-2">{m.role}</p>
                <p className="text-xs text-muted-foreground">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Have Questions?</h2>
          <p className="text-primary-foreground/80 mb-4">We'd love to hear from you.</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span>📧 info@motokah.com</span>
            <span>📍 Dar es Salaam, Tanzania</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
