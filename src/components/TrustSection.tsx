import { IconLock, IconShieldCheck, IconHeadphones, IconSearch } from "@tabler/icons-react";

const trustItems = [
  { icon: IconLock, title: "Secure Payment Gateway", desc: "All transactions protected with advanced encryption", stat: "100,000+ Safe Deals" },
  { icon: IconShieldCheck, title: "Verified Seller Community", desc: "All sellers verified and rated by buyers", stat: "98% Positive Feedback" },
  { icon: IconHeadphones, title: "24/7 Customer Support", desc: "Dedicated support team across Africa", stat: "Avg Response: 5 min" },
  { icon: IconSearch, title: "Optional Vehicle Inspection", desc: "Get professional inspections for peace of mind", stat: "Available in 50+ Cities" },
];

export default function TrustSection() {
  return (
    <section className="container mx-auto py-10">
      <h2 className="text-2xl font-bold text-center mb-8">Why Trust Motokah?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trustItems.map(item => (
          <div key={item.title} className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
            <item.icon size={40} stroke={2.5} className="text-primary mx-auto mb-3" />
            <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
            <span className="text-sm font-semibold text-primary">{item.stat}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
