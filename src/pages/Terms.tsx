import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>By using Motokah, you agree to these terms. Please read them carefully.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">1. Account Registration</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">2. Listings</h2>
          <p>All listings must be accurate and truthful. Motokah reserves the right to remove any listing that violates our guidelines.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">3. Prohibited Content</h2>
          <p>You may not post fraudulent, misleading, or illegal content on the platform.</p>
          <h2 className="text-xl font-bold text-foreground mt-6">4. Limitation of Liability</h2>
          <p>Motokah is a marketplace platform and does not guarantee the quality, safety, or legality of any listed vehicle.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
