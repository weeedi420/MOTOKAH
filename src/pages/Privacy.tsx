import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>Motokah respects your privacy. This policy explains how we collect, use, and protect your personal information.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">Information We Collect</h2>
          <p>We collect information you provide when creating an account, posting listings, and communicating with other users.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">How We Use Your Information</h2>
          <p>Your information is used to provide our services, improve user experience, and communicate important updates.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">Data Protection</h2>
          <p>We implement appropriate security measures to protect your personal data.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
