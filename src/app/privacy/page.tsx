import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — VibeShift",
  description: "VibeShift privacy policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: January 2025</p>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">1. What We Collect</h2>
            <p>When you sign in with GitHub, we receive:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Your GitHub username and profile picture</li>
              <li>Your email address (if public on GitHub)</li>
              <li>An OAuth access token to read your repositories and pull requests</li>
            </ul>
            <p className="mt-3">We do <strong className="text-slate-200">not</strong> store your source code. PR diffs are fetched in real time, analysed, and discarded.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>To authenticate you via GitHub OAuth</li>
              <li>To fetch your repositories and pull requests for analysis</li>
              <li>To post analysis results as PR comments on your behalf</li>
              <li>To display your profile in the dashboard</li>
            </ul>
            <p className="mt-3">We do <strong className="text-slate-200">not</strong> sell, share, or use your data for advertising.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">3. Data Storage</h2>
            <p>Analysis results (integrity scores, violation counts) are stored temporarily in memory to power the analytics dashboard. This data is not persisted to a database and is cleared on server restart.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">4. Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-slate-200">GitHub OAuth</strong> — for authentication</li>
              <li><strong className="text-slate-200">Vercel</strong> — for hosting and deployment</li>
              <li><strong className="text-slate-200">Google AdSense</strong> — for displaying ads on public pages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">5. Cookies</h2>
            <p>We use a session cookie (via NextAuth.js) to keep you signed in. No tracking or advertising cookies are set by VibeShift itself. Google AdSense may set cookies for ad personalisation — you can opt out via <a href="https://adssettings.google.com" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">6. Your Rights</h2>
            <p>You can revoke VibeShift&apos;s access to your GitHub account at any time from <a href="https://github.com/settings/applications" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">GitHub OAuth Apps settings</a>. Signing out via the Settings page also clears your session immediately.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">7. Contact</h2>
            <p>For privacy questions, contact us at <a href="mailto:support@vibeshift.dev" className="text-indigo-400 hover:underline">support@vibeshift.dev</a> or open an issue on our <a href="https://github.com/piyush036-ai/vibeshift" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">GitHub repository</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
