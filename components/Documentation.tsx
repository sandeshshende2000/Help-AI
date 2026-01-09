
import React from 'react';

export const Documentation: React.FC = () => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full overflow-y-auto space-y-6">
      <h2 className="text-2xl font-bold text-red-400 underline decoration-red-500/30">AI Zero-Touch Safety Architecture</h2>
      
      <section className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-red-500">
        <h3 className="text-lg font-semibold mb-2 text-white">AI Context Verification</h3>
        <p className="text-sm text-slate-300">
          The core USP of <strong>Help</strong> is autonomous decision-making. Once a trigger phrase is detected, the app uses <strong>Gemini AI</strong> to analyze the environmental transcript to verify intent before alerting authorities.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">1. The Intent Pipeline</h3>
        <p className="text-sm text-slate-300 mb-4">
          Using <strong>Gemini 3 Flash</strong>, we evaluate the last 5-10 seconds of audio transcript (if permissioned) or the specific trigger phrase context to differentiate between accidental speech and genuine distress.
        </p>
        <pre className="bg-slate-900 p-4 rounded text-xs overflow-x-auto text-blue-400">
{`// Intent Detection (Gemini 3 Flash)
const assess = await gemini.analyze(transcript);
if (assess.isEmergency) {
  dispatchToAuthorities();
  alertFamily();
}`}
        </pre>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">2. Multi-Tier Authority Alerting</h3>
        <p className="text-sm text-slate-300 mb-2">Verification leads to a three-pronged response:</p>
        <ul className="text-sm list-disc pl-5 text-slate-400 space-y-2">
          <li><strong>Law Enforcement:</strong> Automated call/message to Police (100) with incident summary.</li>
          <li><strong>Medical:</strong> Direct dispatch request to Ambulance services (108).</li>
          <li><strong>Personal Circle:</strong> Parallel notification and voice bridge calls to saved contacts.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-yellow-500">Zero-Interaction Protocol</h3>
        <p className="text-sm text-slate-300">
          After the user speaks the phrase, the phone remains idle or locked. No confirmation taps are needed. The system acts completely autonomously to save critical seconds.
        </p>
      </section>
    </div>
  );
};
