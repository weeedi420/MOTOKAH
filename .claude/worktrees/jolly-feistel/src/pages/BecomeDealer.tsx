import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
import { IconBuildingStore, IconCheck, IconLoader } from "@tabler/icons-react";
import { Link, Navigate } from "react-router-dom";

export default function BecomeDealer() {
  usePageTitle("Become a Dealer — Motokah");
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    registration_number: "",
    city: "",
    phone: "",
  });

  if (!user) return <Navigate to="/auth" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name || !form.city || !form.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("dealer_applications").insert({
      user_id: user.id,
      business_name: form.business_name,
      registration_number: form.registration_number || null,
      city: form.city,
      phone: form.phone,
    } as any);
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit application. Please try again.");
    } else {
      setSubmitted(true);
      toast.success("Application submitted! We'll review it shortly.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <IconCheck size={32} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for applying to become a dealer on Motokah. Our team will review your application and get back to you within 2-3 business days.
            </p>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto text-center">
            <IconBuildingStore size={48} className="mx-auto text-primary mb-4" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Become a Dealer</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join Motokah as a verified dealer and gain access to premium features, increased visibility, and a dedicated dealer profile.
            </p>
          </div>
        </section>

        <section className="container mx-auto py-10 max-w-lg">
          {/* Benefits */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-4">Dealer Benefits</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><IconCheck size={18} className="text-success shrink-0 mt-0.5" /> Dedicated dealer profile page</li>
              <li className="flex items-start gap-2"><IconCheck size={18} className="text-success shrink-0 mt-0.5" /> Verified dealer badge on all listings</li>
              <li className="flex items-start gap-2"><IconCheck size={18} className="text-success shrink-0 mt-0.5" /> Appear in the dealer directory</li>
              <li className="flex items-start gap-2"><IconCheck size={18} className="text-success shrink-0 mt-0.5" /> Priority support and listing management</li>
              <li className="flex items-start gap-2"><IconCheck size={18} className="text-success shrink-0 mt-0.5" /> Collect and display customer reviews</li>
            </ul>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="business_name">Business Name *</Label>
              <Input id="business_name" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="e.g. AutoWorld Tanzania" required />
            </div>
            <div>
              <Label htmlFor="registration_number">Business Registration Number</Label>
              <Input id="registration_number" value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))} placeholder="Optional" />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input id="city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g. Dar es Salaam" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+255 xxx xxx xxx" required />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <><IconLoader size={16} className="animate-spin mr-2" /> Submitting...</> : "Submit Application"}
            </Button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
