export default function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-950 px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Title */}
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">Data Sources &amp; Methodology</h1>
          <p className="text-gray-400 text-sm">
            How scores are calculated, where data comes from, and known limitations.
            Transparency is core to the platform — if you spot an issue, contact us.
          </p>
        </div>

        {/* Scoring methodology */}
        <section>
          <h2 className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">Composite Viability Score</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <p className="text-gray-300 text-sm">
              Each country receives a <strong className="text-white">Composite Viability Score (0–100)</strong> calculated
              as a weighted average of five governance dimensions. Higher is better.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium py-2 pr-4">Dimension</th>
                    <th className="text-left text-gray-400 font-medium py-2 pr-4">Weight</th>
                    <th className="text-left text-gray-400 font-medium py-2">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[
                    ['Business Environment', '35%', 'World Bank B-READY 2025 composite'],
                    ['Political Stability', '25%', 'WGI Political Stability & Absence of Violence'],
                    ['Rule of Law', '15%', 'WGI Rule of Law'],
                    ['Corruption Control', '15%', 'WGI Control of Corruption'],
                    ['Government Effectiveness', '10%', 'WGI Government Effectiveness'],
                  ].map(([dim, weight, source]) => (
                    <tr key={dim}>
                      <td className="text-gray-200 py-2 pr-4">{dim}</td>
                      <td className="text-blue-400 font-mono py-2 pr-4">{weight}</td>
                      <td className="text-gray-400 py-2">{source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pt-2">
              <p className="text-gray-500 text-xs mb-2">Score bands:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Strong 75+', color: '#22c55e' },
                  { label: 'Good 60–74', color: '#84cc16' },
                  { label: 'Moderate 45–59', color: '#eab308' },
                  { label: 'Weak 30–44', color: '#f97316' },
                  { label: 'Poor <30', color: '#ef4444' },
                ].map(({ label, color }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data sources table */}
        <section>
          <h2 className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">Data Sources</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Source</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Metric(s)</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Coverage</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  ['World Bank WGI', 'Political Stability, Rule of Law, Corruption Control, Govt Effectiveness', '205 countries', '2023'],
                  ['World Bank B-READY', 'Business regulatory environment — 10 pillars', '108 countries', '2025'],
                  ['World Bank WDI', 'GDP, GDP per capita, GDP growth, FDI (% of GDP), population', '200+ countries', '2023'],
                  ['World Bank LPI', 'Logistics Performance Index (supply chain quality)', '140+ countries', '2023'],
                  ['WITS (World Bank)', 'Applied tariff rate — weighted mean', '180+ countries', '2023'],
                  ['Static tax table', 'Corporate income tax rate', '116 countries', '2024'],
                  ['US State Dept / DoD', 'ITAR/Allied nation classification', '218 countries', '2025'],
                ].map(([source, metric, coverage, year]) => (
                  <tr key={source} className="hover:bg-gray-800/30 transition-colors">
                    <td className="text-gray-200 font-medium px-5 py-3">{source}</td>
                    <td className="text-gray-400 px-5 py-3">{metric}</td>
                    <td className="text-gray-400 px-5 py-3">{coverage}</td>
                    <td className="text-blue-400 font-mono px-5 py-3">{year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* B-READY pillars */}
        <section>
          <h2 className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">B-READY Pillars (10 Indicators)</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-4">
              The World Bank B-READY 2025 report evaluates business regulatory quality and public services
              across 10 topic areas. Countries not yet covered by B-READY rely solely on WGI indicators for
              the Business Environment dimension.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Business Entry', 'Business Location', 'Utility Services', 'Labor',
                'Financial Services', 'International Trade', 'Taxation',
                'Dispute Resolution', 'Market Competition', 'Business Insolvency',
              ].map(pillar => (
                <div key={pillar} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-gray-300">{pillar}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Known biases & limitations */}
        <section>
          <h2 className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">Known Biases &amp; Limitations</h2>
          <div className="space-y-3">
            {[
              {
                title: 'World Bank ESG Bias',
                severity: 'medium',
                text: 'World Bank qualitative assessments tend to under-represent oil, gas, mining, and conventional energy sectors in economic profiles. Our AI reports explicitly counter this — hydrocarbon and extractive industries are included whenever they are materially relevant to a country\'s economy.',
              },
              {
                title: 'WGI Perception Lag',
                severity: 'low',
                text: 'World Governance Indicators aggregate expert and household surveys. They are robust for cross-country comparison but can lag 12–24 months behind rapid political change. Verify with current news sources (linked in country profiles) before making decisions.',
              },
              {
                title: 'B-READY Coverage Gap',
                severity: 'medium',
                text: '108 of 218 countries covered by B-READY 2025 (pilot program). Countries outside coverage show N/A for B-READY pillars and rely more heavily on WGI data for business environment scoring.',
              },
              {
                title: 'Corporate Tax Rates',
                severity: 'low',
                text: 'Statutory rates from a static table — may not reflect recent reforms, tax holidays, special economic zones, or effective rates after incentives. Always verify with local tax counsel.',
              },
              {
                title: 'Territories & Non-Sovereign Entities',
                severity: 'low',
                text: 'Territories, crown dependencies, and non-sovereign entities (Bermuda, Channel Islands, Cayman Islands, etc.) may have limited or no data across some indicators. Scores reflect available data only.',
              },
              {
                title: 'AI-Generated Reports',
                severity: 'info',
                text: 'Country reports are generated by Claude Haiku (Anthropic) using our structured data prompt. They are a starting point for due diligence — not legal or financial advice. Regenerate with the ↺ button if you suspect a cached report is stale.',
              },
            ].map(({ title, severity, text }) => (
              <div key={title} className={`bg-gray-900 border rounded-xl p-4 flex gap-3 ${
                severity === 'medium' ? 'border-yellow-800/50' :
                severity === 'info' ? 'border-blue-800/50' : 'border-gray-800'
              }`}>
                <span className={`text-xs font-bold uppercase mt-0.5 flex-shrink-0 w-12 ${
                  severity === 'medium' ? 'text-yellow-500' :
                  severity === 'info' ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  {severity === 'info' ? 'Info' : severity === 'medium' ? 'Note' : 'Minor'}
                </span>
                <div>
                  <p className="text-gray-200 text-sm font-medium mb-1">{title}</p>
                  <p className="text-gray-400 text-sm">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ITAR / Allied status */}
        <section>
          <h2 className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">Allied / ITAR Status Classification</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-sm mb-4">
              The A&amp;D Allied Status feature classifies countries for aerospace &amp; defense industry context.
              Classification is based on current US defense treaty arrangements, ITAR Part 126.1 embargo list,
              and OFAC sanction designations as of 2025.
            </p>
            <div className="space-y-2">
              {[
                { label: 'Five Eyes', color: '#22c55e', desc: 'Highest trust — US, UK, Canada, Australia, New Zealand' },
                { label: 'NATO Ally', color: '#3b82f6', desc: '29 non-Five-Eyes NATO member states' },
                { label: 'Treaty Ally / MNNA', color: '#8b5cf6', desc: 'US treaty allies and Major Non-NATO Allies' },
                { label: 'Neutral', color: '#6b7280', desc: 'No special US defense designation' },
                { label: 'Caution', color: '#f59e0b', desc: 'Strategic competitors — significant EAR/ITAR review required' },
                { label: 'Restricted', color: '#ef4444', desc: 'ITAR Part 126.1 embargoed or comprehensive sanctions' },
              ].map(({ label, color, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: color }} />
                  <span>
                    <span className="text-gray-200 text-sm font-medium">{label}: </span>
                    <span className="text-gray-400 text-sm">{desc}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-xs mt-4 border-t border-gray-800 pt-4">
              This classification is for general guidance only. Actual ITAR/EAR compliance determinations require
              qualified legal counsel. Classifications reflect general status and may not capture all nuances of
              specific transaction types.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-xs">
            <strong className="text-gray-400">Disclaimer:</strong> All data, scores, and AI-generated reports on this platform are for
            informational purposes only and do not constitute legal, financial, investment, or compliance advice.
            Data is updated periodically; always verify critical figures with primary sources before making
            business decisions. Global Reshoring Intelligence is not responsible for decisions made based on
            information provided by this platform.
          </p>
        </div>

      </div>
    </div>
  )
}
