import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { IconUpload, IconX, IconCheck } from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { africanCities, carMakes } from "@/data/mockData";

const tanzaniaCities = africanCities;
const carBrands = carMakes;

const steps = ["Basic Info", "Details", "Photos", "Price & Location", "Review"];

const bodyTypes = ["Sedan", "SUV", "Hatchback", "Pickup", "Van", "Coupe", "Wagon", "Convertible"];
const transmissions = ["Automatic", "Manual", "CVT"];
const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
const conditions = ["New", "Used", "Certified Pre-owned"];

interface FormData {
  make: string; model: string; year: string; bodyType: string;
  transmission: string; fuelType: string; color: string; mileage: string; condition: string;
  title: string; description: string;
  price: string; currency: string; city: string;
}

const defaultForm: FormData = {
  make: "", model: "", year: new Date().getFullYear().toString(), bodyType: "",
  transmission: "", fuelType: "", color: "", mileage: "", condition: "Used",
  title: "", description: "",
  price: "", currency: "TZS", city: "",
};

export default function SellCar() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(() => {
    const saved = localStorage.getItem("sellCarDraft");
    return saved ? JSON.parse(saved) : defaultForm;
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  usePageTitle("Sell Your Car");
  const update = (key: keyof FormData, val: string) => {
    const next = { ...form, [key]: val };
    setForm(next);
    localStorage.setItem("sellCarDraft", JSON.stringify(next));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_SIZE_MB = 5;
    const selected = Array.from(e.target.files || []);
    const oversized = selected.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      toast({ title: "File too large", description: `Each image must be under ${MAX_SIZE_MB}MB. ${oversized.length} file(s) skipped.`, variant: "destructive" });
    }
    const valid = selected.filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024).slice(0, 10 - images.length);
    setImages((prev) => [...prev, ...valid]);
    valid.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((p) => [...p, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!user) return;
    const isVerified = user.email_confirmed_at || user.confirmed_at;
    if (!isVerified) {
      toast({ title: "Email not verified", description: "Please verify your email address before listing a vehicle.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const title = form.title || `${form.year} ${form.make} ${form.model}`;
      const { data: listing, error } = await supabase.from("listings").insert({
        seller_id: user.id,
        title,
        make: form.make,
        model: form.model,
        year: parseInt(form.year),
        price: parseFloat(form.price),
        currency: form.currency,
        mileage: form.mileage ? parseInt(form.mileage) : null,
        transmission: form.transmission || null,
        fuel_type: form.fuelType || null,
        body_type: form.bodyType || null,
        color: form.color || null,
        condition: form.condition,
        description: form.description || null,
        city: form.city || null,
        status: "pending" as const,
      }).select().single();

      if (error) throw error;

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const path = `${user.id}/${listing.id}/${i}-${file.name}`;
        const { error: uploadErr } = await supabase.storage.from("listing-images").upload(path, file);
        if (uploadErr) continue;
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        await supabase.from("listing_images").insert({
          listing_id: listing.id,
          image_url: urlData.publicUrl,
          display_order: i,
        });
      }

      localStorage.removeItem("sellCarDraft");
      toast({ title: "Listing submitted!", description: "Your listing is pending review." });
      navigate("/profile");
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.make && form.model && form.year;
    if (step === 1) return form.condition;
    if (step === 3) return form.price;
    return true;
  };

  const selectClass = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Sell Your Car</h1>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <IconCheck size={16} /> : i + 1}
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:block">{s}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Make *</label>
              <select value={form.make} onChange={(e) => update("make", e.target.value)} className={selectClass}>
                <option value="">Select make</option>
                {carBrands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Model *</label>
              <Input value={form.model} onChange={(e) => update("model", e.target.value)} placeholder="e.g. Corolla, Civic" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Year *</label>
              <Input type="number" value={form.year} onChange={(e) => update("year", e.target.value)} min="1990" max={new Date().getFullYear() + 1} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Body Type</label>
              <select value={form.bodyType} onChange={(e) => update("bodyType", e.target.value)} className={selectClass}>
                <option value="">Select body type</option>
                {bodyTypes.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Transmission</label>
              <select value={form.transmission} onChange={(e) => update("transmission", e.target.value)} className={selectClass}>
                <option value="">Select</option>
                {transmissions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Fuel Type</label>
              <select value={form.fuelType} onChange={(e) => update("fuelType", e.target.value)} className={selectClass}>
                <option value="">Select</option>
                {fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Color</label>
              <Input value={form.color} onChange={(e) => update("color", e.target.value)} placeholder="e.g. White, Black" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Mileage (km)</label>
              <Input type="number" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} placeholder="e.g. 50000" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Condition *</label>
              <select value={form.condition} onChange={(e) => update("condition", e.target.value)} className={selectClass}>
                {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Upload up to 10 photos. First photo will be the cover.</p>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
              <IconUpload size={24} className="text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload photos</span>
              <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {previews.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                      <IconX size={12} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[8px] bg-primary text-primary-foreground px-1 rounded">Cover</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Price & Location */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Ad Title</label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder={`${form.year} ${form.make} ${form.model}`} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe your vehicle..." className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">Price *</label>
                <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="e.g. 45000000" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Currency</label>
                <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className={selectClass}>
                  <option value="TZS">TZS</option>
                  <option value="USD">USD</option>
                  <option value="KES">KES</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">City</label>
              <select value={form.city} onChange={(e) => update("city", e.target.value)} className={selectClass}>
                <option value="">Select city</option>
                {tanzaniaCities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Review Your Listing</h2>
            <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
              <p><span className="font-semibold">Title:</span> {form.title || `${form.year} ${form.make} ${form.model}`}</p>
              <p><span className="font-semibold">Make / Model:</span> {form.make} {form.model}</p>
              <p><span className="font-semibold">Year:</span> {form.year}</p>
              <p><span className="font-semibold">Body Type:</span> {form.bodyType || "—"}</p>
              <p><span className="font-semibold">Transmission:</span> {form.transmission || "—"}</p>
              <p><span className="font-semibold">Fuel:</span> {form.fuelType || "—"}</p>
              <p><span className="font-semibold">Mileage:</span> {form.mileage ? `${parseInt(form.mileage).toLocaleString()} km` : "—"}</p>
              <p><span className="font-semibold">Condition:</span> {form.condition}</p>
              <p><span className="font-semibold">Color:</span> {form.color || "—"}</p>
              <p><span className="font-semibold">Price:</span> {form.currency} {form.price ? parseInt(form.price).toLocaleString() : "—"}</p>
              <p><span className="font-semibold">City:</span> {form.city || "—"}</p>
              {form.description && <p><span className="font-semibold">Description:</span> {form.description}</p>}
              <p><span className="font-semibold">Photos:</span> {images.length}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">Back</Button>
          )}
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="flex-1">Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? "Submitting..." : "Submit Listing"}
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
