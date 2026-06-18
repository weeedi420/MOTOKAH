import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="prose prose-sm text-muted-foreground space-y-4">

          <p>
            Welcome to Motokah. These Terms &amp; Conditions ("Terms") govern your access to and use of
            the Motokah website, mobile applications, listings and related services (together, the
            "Platform"). By accessing or using the Platform you agree to be bound by these Terms. If you
            do not agree, do not use the Platform.
          </p>

          {/* ── 1. OWNERSHIP ── */}
          <h2 className="text-xl font-bold text-foreground mt-8">1. Platform Ownership &amp; Intellectual Property</h2>

          <p>
            The Platform — including but not limited to the website at{" "}
            <strong className="text-foreground">motokah.com</strong>, all mobile applications, software,
            source code, algorithms, databases, vehicle listings, designs, brand assets, trade marks,
            domain names, content, data and all associated intellectual property (collectively the
            "Platform IP") — is the exclusive property of{" "}
            <a
              href="https://1pointsolutions.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              1Point Solutions
            </a>{" "}
            (a UK-registered entity, hereinafter "1PS").
          </p>

          <p>
            1PS has granted a conditional operational licence to{" "}
            <strong className="text-foreground">Motokah Africa Limited</strong> ("Motokah Africa") to
            operate the Platform under the "Motokah" brand in East Africa and other agreed territories.
            This licence is conditional and the formal written terms of the licence agreement between 1PS
            and Motokah Africa Limited are currently being finalised and have not yet been fully executed.
          </p>

          <p>
            <strong className="text-foreground">
              Until a formal written licensing agreement is signed and executed by both 1PS and Motokah
              Africa Limited, 1PS retains full, unconditional and exclusive ownership of, and all rights
              in, the Platform and all Platform IP. No rights of ownership are transferred or waived by
              virtue of this operational licence.
            </strong>{" "}
            1PS reserves the right to suspend, modify, withdraw or terminate this operational licence at
            any time prior to the execution of a formal written agreement, without liability to Motokah
            Africa Limited or any third party.
          </p>

          <p>
            Nothing in these Terms, in any listing, or in any use of the Platform by any person or
            entity transfers, assigns or implies any ownership of the Platform IP to Motokah Africa
            Limited, its users, dealers, partners or any other party. All intellectual property rights
            remain at all times the exclusive property of 1PS.
          </p>

          {/* ── 2. ACCOUNT ── */}
          <h2 className="text-xl font-bold text-foreground mt-8">2. Account Registration</h2>
          <p>
            You must provide accurate, current and complete information when creating an account. You are
            responsible for maintaining the confidentiality and security of your account credentials and
            for all activity that occurs under your account. You must be at least 18 years old to create
            an account.
          </p>

          {/* ── 3. LISTINGS ── */}
          <h2 className="text-xl font-bold text-foreground mt-8">3. Listings</h2>
          <p>
            All listings must be accurate, lawful and truthful. You are solely responsible for the
            content of any listing you post, including price, condition, mileage, ownership and
            documentation. Motokah Africa Limited reserves the right to review, edit, reject or remove
            any listing that violates these Terms or applicable law, at its sole discretion.
          </p>

          {/* ── 4. PROHIBITED ── */}
          <h2 className="text-xl font-bold text-foreground mt-8">4. Prohibited Conduct</h2>
          <p>
            You may not post fraudulent, misleading, stolen, counterfeit or illegal content; impersonate
            another person; scrape, copy or reverse-engineer the Platform or its listings; or use the
            Platform for any unlawful purpose. Vehicles must be legally owned and free to sell.
          </p>

          {/* ── 5. TRANSACTIONS ── */}
          <h2 className="text-xl font-bold text-foreground mt-8">5. Transactions Between Users</h2>
          <p>
            Motokah is a marketplace that connects buyers and sellers. Neither 1PS nor Motokah Africa
            Limited is a party to any transaction, takes possession of any vehicle, or handles payment
            between buyers and sellers. You are responsible for verifying any vehicle, seller and
            documentation before making any payment. Always inspect a vehicle in person and confirm
            ownership documents before paying.
          </p>

          {/* ── 6. LIABILITY ── */}
          <h2 className="text-xl font-bold text-foreground mt-8">6. Limitation of Liability</h2>
          <p>
            The Platform is provided on an "as is" and "as available" basis. To the fullest extent
            permitted by applicable law, neither 1Point Solutions nor Motokah Africa Limited guarantees
            the quality, safety, legality or accuracy of any vehicle, listing or user, and shall not be
            liable for any direct, indirect, incidental or consequential loss arising from any
            transaction or from your use of the Platform.
          </p>

          {/* ── 7. CHANGES ── */}
          <h2 className="text-xl font-bold text-foreground mt-8">7. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Platform after changes are
            posted constitutes acceptance of the revised Terms. Material changes will be reflected by an
            updated "Last updated" date above.
          </p>

          {/* ── 8. GOVERNING LAW ── */}
          <h2 className="text-xl font-bold text-foreground mt-8">8. Governing Law</h2>
          <p>
            These Terms are governed by the laws of England and Wales (as the jurisdiction of the
            Platform owner, 1Point Solutions), without prejudice to the rights of users under the laws
            of the East African markets in which the Platform operates.
          </p>

          {/* ── 9. CONTACT ── */}
          <h2 className="text-xl font-bold text-foreground mt-8">9. Contact</h2>
          <p>
            For questions about these Terms, contact Motokah Africa Limited via the{" "}
            <a href="/contact" className="text-primary hover:underline">Contact page</a>. For matters
            relating to platform ownership or intellectual property, contact 1Point Solutions at{" "}
            <a
              href="https://1pointsolutions.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              1pointsolutions.cloud
            </a>.
          </p>

        </div>
      </div>
      <Footer />
    </div>
  );
}
