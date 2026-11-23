import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Terminal, Users, Trash2, Scale, Clock } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-800 selection:text-white">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.02] blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-white/[0.02] blur-[140px] rounded-full pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #27272a 1px, transparent 1px),
            linear-gradient(to bottom, #27272a 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 lg:py-20">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-zinc-800/80">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <Link
            to="/"
            className="text-sm font-semibold tracking-tight text-white hover:text-zinc-300 transition"
          >
            Parallel Coder
          </Link>
        </div>

        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4">
            <Clock size={12} />
            Last Updated: November 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-zinc-400 text-lg leading-relaxed">
            Please read these terms carefully before accessing or using Parallel Coder. By creating an account, signing in, or using our real-time collaborative workspace, you agree to be bound by these terms.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="p-8 rounded-3xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Scale size={20} className="text-zinc-400" />
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            </div>
            <p className="text-zinc-400">
              Parallel Coder ("we", "our", or "the Platform") provides real-time collaborative development workspaces, live editor synchronisation, workspace chat, and sandboxed code execution. By accessing our services, creating an account, or authenticating via third-party providers (Google or GitHub), you confirm that you are at least 13 years old (or the applicable age of digital consent in your jurisdiction) and agree to abide by these Terms and Conditions.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-8 rounded-3xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Shield size={20} className="text-zinc-400" />
              <h2 className="text-xl font-semibold">2. User Accounts & Security</h2>
            </div>
            <p className="text-zinc-400">
              To use Parallel Coder, you may register via email and password or use supported OAuth providers (Google and GitHub).
            </p>
            <ul className="mt-3 list-disc list-inside space-y-2 text-zinc-400 pl-2">
              <li>You are solely responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree to notify us immediately of any unauthorized access or security breach involving your account.</li>
              <li>You may not impersonate other users or create accounts for malicious, abusive, or spam purposes.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-8 rounded-3xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Users size={20} className="text-zinc-400" />
              <h2 className="text-xl font-semibold">3. Workspaces & Collaboration Rules</h2>
            </div>
            <p className="text-zinc-400">
              Parallel Coder allows team members to create shared workspaces with role-based permissions (Owner, Admin, Editor, Viewer) and collaborate simultaneously via WebSocket synchronization:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-2 text-zinc-400 pl-2">
              <li>Workspace Owners and Admins control member access and invitation codes.</li>
              <li>You agree not to use workspace channels or chats to transmit abusive, hateful, defamatory, or unlawful materials.</li>
              <li>Any member violating workspace or community safety guidelines may be removed by the workspace owner or platform administrators.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-8 rounded-3xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Terminal size={20} className="text-zinc-400" />
              <h2 className="text-xl font-semibold">4. Code Execution & Sandbox Acceptable Use</h2>
            </div>
            <p className="text-zinc-400">
              Parallel Coder features an integrated multi-language code runner supporting <strong>JavaScript, Python, C, C++, and Java</strong>. All code execution is subject to strict acceptable use policies:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-2 text-zinc-400 pl-2">
              <li><strong className="text-zinc-200">No Malicious Payloads:</strong> You must not execute code designed to exploit, attack, or compromise our hosting infrastructure, containers, or other users.</li>
              <li><strong className="text-zinc-200">No Resource Abuse:</strong> Cryptocurrency mining, distributed denial of service (DDoS) scripts, fork bombs, network scans, and attempts to circumvent memory/CPU limits are strictly prohibited.</li>
              <li><strong className="text-zinc-200">Execution Limits:</strong> Each execution is subject to execution timeouts (15 seconds) and output buffer limits (64 KB) to protect server stability.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-8 rounded-3xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Scale size={20} className="text-zinc-400" />
              <h2 className="text-xl font-semibold">5. Intellectual Property & Code Ownership</h2>
            </div>
            <p className="text-zinc-400">
              <strong className="text-zinc-200">You retain 100% full ownership and copyright of all code, projects, and text files you create or upload on Parallel Coder.</strong> We claim no intellectual property rights over your software. By uploading or editing code in shared workspaces, you grant other workspace members the right to view or edit that code in accordance with the workspace role assigned to them.
            </p>
          </section>

          {/* Section 6 - Delete Account */}
          <section className="p-8 rounded-3xl border border-red-950/60 bg-red-950/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4 text-red-300">
              <Trash2 size={20} className="text-red-400" />
              <h2 className="text-xl font-semibold">6. User Rights & Account Deletion</h2>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              We respect your digital privacy and your right to be forgotten. Users can permanently delete their account at any time:
            </p>
            <ul className="mt-3 list-disc list-inside space-y-2 text-zinc-400 pl-2">
              <li>You can initiate account deletion directly from your <strong>Dashboard &gt; Settings &gt; Delete Account</strong>.</li>
              <li>When your account is deleted, your user profile, authentication credentials, owned workspaces, files, and chat messages are <strong className="text-zinc-200">permanently erased</strong> from our active databases in accordance with our cascade deletion policy.</li>
              <li>This action is irreversible. Once confirmed, your data cannot be recovered.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="p-8 rounded-3xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white mb-4">7. Disclaimer of Warranties & Limitation of Liability</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Parallel Coder is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. While we strive for high uptime and hardened security, we do not warrant that the service will be uninterrupted, error-free, or free from data loss. We strongly encourage developers to maintain local backups of their code repositories.
            </p>
          </section>

          {/* Section 8 */}
          <section className="p-8 rounded-3xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white mb-4">8. Modifications & Contact</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We reserve the right to revise these Terms from time to time. Continued use of Parallel Coder after modifications constitutes acceptance of the updated terms. If you have questions regarding these Terms or account deletion, please open an issue on our GitHub repository or contact the project maintainers.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-14 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Parallel Coder. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
            <Link to="/" className="hover:text-white transition">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
