import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Terms &amp; Conditions</h1>
        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>
            Welcome to Motokah. These Terms &amp; Conditions ("Terms") govern your access to and use of
            the Motokah website, mobile applications, listings and related services (together, the
            "Platform"). By accessing or using the Platform you agree to be bound by these Terms. If you
            do not agree, do not use the Platform.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6">1. Ownership &amp; Licence</h2>
          <p>
            The Platform — including this website, mobile applications, software, source code, design,
            database, vehicle listings, content and all related services — is owned by{" "}
            <strong className="text-foreground">1Point Solutions</strong>. 1Point Solutions has licensed
            the Platform, its software, listings and services to{" "}
            <strong className="text-foreground">Motokah Africa Limited</strong> for operation under the
            "Motokah" brand. All intellectual property rights remain the exclusive property of 1Point
            Solutions. Nothing in these Terms transfers any ownership of the Platform to you or to any
            other party.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6">2. Account Registration</h2>
          <p>
            You must provide accurate, current and complete information when creating an account. You are
            responsible for maintaining the confidentiality and security of your account credentials and
            for all activity that occurs under your account. You must be at least 18 years old to create
            an account.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6">3. Listings</h2>
          <p>
            All listings must be accurate, lawful and truthful. You are solely responsible for the
            content of any listing you post, including price, condition, mileage, ownership and
            documentation. Motokah Africa Limited reserves the right to review, edit, reject or remove
            any listing that violates these Terms or applicable law, at its sole discretion.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6">4. Prohibited Conduct</h2>
          <p>
            You may not post fraudulent, misleading, stolen, counterfeit or illegal content; impersonate
            another person; scrape or copy the Platform or its listings; or use the Platform for any
            unlawful purpose. Vehicles must be legally owned and free to sell.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6">5. Transactions Between Users</h2>
          <p>
            Motokah is a marketplace that connects buyers and sellers. We are not a party to any
            transaction, do not take possession of any vehicle, and do not handle payment between buyers
            and sellers. You are responsible for verifying any vehicle, seller and documentation before
            paying any money. Always inspect a vehicle in person and confirm ownership before payment.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6">6. Limitation of Liability</h2>
          <p>
            The Platform is provided on an "as is" and "as available" basis. To the fullest extent
            permitted by law, 1Point Solutions and Motokah Africa Limited do not guarantee the quality,
            safety, legality or accuracy of any vehicle, listing or user, and shall not be liable for any
            loss arising from a transaction or your use of the Platform.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6">7. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Platform after changes are
            posted constitutes acceptance of the revised Terms.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6">8. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the United Republic of Tanzania and the applicable
            laws of the East African markets in which Motokah operates.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-6">9. Contact</h2>
          <p>
            For questions about these Terms, contact Motokah Africa Limited via the Contact page.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
