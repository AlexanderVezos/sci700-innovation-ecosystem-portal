import PageTransition from "@/components/PageTransition";

function PrivacyPolicy() {
  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-slate-900 px-8 md:px-16 pt-36 pb-20">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-none mt-3">
              Privacy Policy
            </h1>
            <p className="text-slate-400 mt-4 text-sm">Last updated: April 2026</p>
          </div>
        </div>

        <div className="px-8 md:px-16 py-16 max-w-2xl mx-auto prose prose-slate prose-sm">
          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">1. About This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              StartupSC ("we", "us", "our") operates the Sunshine Coast Innovation Ecosystem Portal (the "Platform"). This Privacy Policy explains how we collect, use, store, and disclose personal information submitted through the Platform, in accordance with the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs).
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              By submitting information to the Platform (including startup listings, events, or opportunity posts) you agree to the collection and use of your information as described in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">2. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed">We collect personal information you voluntarily provide when submitting listings, including:</p>
            <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
              <li>Organisation or startup name</li>
              <li>Contact details — email address, phone number, and/or website URL</li>
              <li>Business description, founding year, team size, and stage</li>
              <li>Event details including title, date, location, and organiser name</li>
              <li>Opportunity details including type, sector, and deadline</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              We do not collect sensitive information (as defined under the Privacy Act) and do not require account registration to browse the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">3. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed">We use submitted information to:</p>
            <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
              <li>Display approved listings publicly on the Platform</li>
              <li>Review submissions for accuracy, legitimacy, and compliance with our Terms</li>
              <li>Contact you regarding your submission if required</li>
              <li>Improve the Platform's content and features</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              We will not use your information for direct marketing without your explicit consent, and we will not sell or rent your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">4. Public Disclosure of Listings</h2>
            <p className="text-slate-600 leading-relaxed">
              Information submitted in startup, event, and opportunity listings (including any contact details you choose to provide) will be displayed publicly on the Platform once approved. By submitting a listing with contact details, you consent to that information being visible to other users of the Platform.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              You should only include contact information you are comfortable sharing publicly. Do not include personal home addresses or other sensitive personal details in listing descriptions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">5. Data Storage and Security</h2>
            <p className="text-slate-600 leading-relaxed">
              Submitted data is stored in a cloud database hosted by MongoDB Atlas. We take reasonable technical and organisational measures to protect personal information from misuse, loss, unauthorised access, modification, or disclosure. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">6. Cookies and Analytics</h2>
            <p className="text-slate-600 leading-relaxed">
              The Platform may use standard browser storage (such as localStorage) to remember your display preferences (e.g. reduced motion settings). We do not currently use third-party analytics cookies or advertising trackers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-2">8. Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the Platform after changes are posted constitutes acceptance of the revised policy.
            </p>
          </section>

        </div>
      </div>
    </PageTransition>
  );
}

export default PrivacyPolicy;
