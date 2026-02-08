"use client";

import { useEffect, useState } from "react";
import { Copy, Check, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface SystemData {
  appUrl: string;
  database: {
    name: string;
    port: number;
    user: string;
    containerName: string;
  };
  application: {
    port: number;
    pm2Process: string;
    domain: string;
  };
  fortnightly: {
    anchorDate: string;
    currentWeek: number;
    nextWeek1: string;
    nextWeek2: string;
  };
  envVars: Record<string, boolean>;
  integrations: {
    slack: boolean;
    resend: boolean;
    googleSheetSync: boolean;
  };
  apiEndpoints: {
    method: string;
    path: string;
    description: string;
  }[];
  slotGrid: {
    position: number;
    day: string;
    time: string;
    w1Code: string;
    w2Code: string;
  }[];
}

export default function SystemPage() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    fetch("/api/admin/system")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-warm-grey">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-error">
        Failed to load system information.
      </div>
    );
  }

  const exampleUrl = `${data.appUrl}/enrol?firstName=Jane&lastName=Smith&email=jane@example.com&phone=07700900000&closer=Jake`;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-navy">System Reference</h1>

      {/* Enrolment URL Format */}
      <Section title="Enrolment URL Format">
        <p className="text-sm text-charcoal mb-3">
          Students are redirected from Go High Level to the enrolment page using URL parameters:
        </p>
        <code className="block bg-sand px-4 py-3 rounded-md text-sm text-navy break-all mb-4">
          {data.appUrl}/enrol?firstName=___&amp;lastName=___&amp;email=___&amp;phone=___&amp;closer=___
        </code>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b border-sand-dark bg-sand">
              <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">Parameter</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">Description</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">Example</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">Required</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-sand-dark">
              <td className="px-3 py-2 font-mono text-navy">firstName</td>
              <td className="px-3 py-2">Student&apos;s first name</td>
              <td className="px-3 py-2 text-warm-grey">Jane</td>
              <td className="px-3 py-2">Yes</td>
            </tr>
            <tr className="border-b border-sand-dark bg-sand/30">
              <td className="px-3 py-2 font-mono text-navy">lastName</td>
              <td className="px-3 py-2">Student&apos;s last name</td>
              <td className="px-3 py-2 text-warm-grey">Smith</td>
              <td className="px-3 py-2">Yes</td>
            </tr>
            <tr className="border-b border-sand-dark">
              <td className="px-3 py-2 font-mono text-navy">email</td>
              <td className="px-3 py-2">Student&apos;s email address</td>
              <td className="px-3 py-2 text-warm-grey">jane@example.com</td>
              <td className="px-3 py-2">Yes</td>
            </tr>
            <tr className="border-b border-sand-dark bg-sand/30">
              <td className="px-3 py-2 font-mono text-navy">phone</td>
              <td className="px-3 py-2">Student&apos;s phone number</td>
              <td className="px-3 py-2 text-warm-grey">07700900000</td>
              <td className="px-3 py-2">Yes</td>
            </tr>
            <tr className="border-b border-sand-dark">
              <td className="px-3 py-2 font-mono text-navy">closer</td>
              <td className="px-3 py-2">Sales closer&apos;s first name (auto-created if new)</td>
              <td className="px-3 py-2 text-warm-grey">Jake</td>
              <td className="px-3 py-2">Optional</td>
            </tr>
          </tbody>
        </table>

        <div className="flex items-center gap-2">
          <code className="flex-1 bg-sand px-3 py-2 rounded-md text-xs text-charcoal break-all">
            {exampleUrl}
          </code>
          <button
            onClick={() => copyToClipboard(exampleUrl)}
            className="text-warm-grey hover:text-navy flex-shrink-0 p-2"
            title="Copy example URL"
          >
            {copiedUrl ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          </button>
        </div>
      </Section>

      {/* Database & Application Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Database Info">
          <InfoRow label="Database name" value={data.database.name} />
          <InfoRow label="Port" value={String(data.database.port)} />
          <InfoRow label="User" value={data.database.user} />
          <InfoRow label="Container name" value={data.database.containerName} />
        </Section>

        <Section title="Application Info">
          <InfoRow label="App port" value={String(data.application.port)} />
          <InfoRow label="PM2 process" value={data.application.pm2Process} />
          <InfoRow label="Domain" value={data.application.domain} />
        </Section>
      </div>

      {/* API Endpoints */}
      <Section title="API Endpoints">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">Method</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">Path</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">Description</th>
              </tr>
            </thead>
            <tbody>
              {data.apiEndpoints.map((ep, i) => (
                <tr key={`${ep.method}-${ep.path}`} className={i % 2 === 1 ? "bg-sand/30" : ""}>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      ep.method === "GET" ? "bg-success/10 text-success" :
                      ep.method === "POST" ? "bg-info/10 text-info" :
                      ep.method === "PUT" ? "bg-warning/10 text-warning" :
                      "bg-error/10 text-error"
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-navy">{ep.path}</td>
                  <td className="px-3 py-2 text-charcoal">{ep.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Slot Grid Reference */}
      <Section title="Slot Grid Reference">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-dark bg-sand">
                <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">Pos</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">Day</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">Time</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">W1 Code</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-warm-grey uppercase">W2 Code</th>
              </tr>
            </thead>
            <tbody>
              {data.slotGrid.map((slot, i) => (
                <tr key={slot.position} className={i % 2 === 1 ? "bg-sand/30" : ""}>
                  <td className="px-3 py-2 font-medium text-navy">{slot.position}</td>
                  <td className="px-3 py-2 text-charcoal">{slot.day}</td>
                  <td className="px-3 py-2 text-charcoal">{slot.time}</td>
                  <td className="px-3 py-2 font-mono text-navy">{slot.w1Code}</td>
                  <td className="px-3 py-2 font-mono text-navy">{slot.w2Code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Fortnightly Info */}
      <Section title="Fortnightly Info">
        <InfoRow label="Anchor date" value={data.fortnightly.anchorDate} />
        <InfoRow label="Current week" value={`Week ${data.fortnightly.currentWeek}`} highlight />
        <InfoRow label="Next Week 1 date" value={data.fortnightly.nextWeek1} />
        <InfoRow label="Next Week 2 date" value={data.fortnightly.nextWeek2} />
      </Section>

      {/* Environment & Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Environment Status">
          {Object.entries(data.envVars).map(([key, set]) => (
            <div key={key} className="flex items-center gap-2 py-1">
              {set ? (
                <CheckCircle size={16} className="text-success flex-shrink-0" />
              ) : (
                <XCircle size={16} className="text-error flex-shrink-0" />
              )}
              <span className="text-sm font-mono text-charcoal">{key}</span>
            </div>
          ))}
        </Section>

        <Section title="Integration Status">
          <IntegrationRow label="Slack webhook" configured={data.integrations.slack} />
          <IntegrationRow label="Resend (email)" configured={data.integrations.resend} />
          <IntegrationRow label="Google Sheet sync" configured={data.integrations.googleSheetSync} notImplemented />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-sand-dark shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-sand-dark">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-warm-grey">{label}</span>
      <span className={highlight ? "font-semibold text-navy bg-navy/10 px-2 py-0.5 rounded" : "font-medium text-charcoal font-mono"}>
        {value}
      </span>
    </div>
  );
}

function IntegrationRow({ label, configured, notImplemented }: { label: string; configured: boolean; notImplemented?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      {notImplemented ? (
        <AlertTriangle size={16} className="text-warning flex-shrink-0" />
      ) : configured ? (
        <CheckCircle size={16} className="text-success flex-shrink-0" />
      ) : (
        <XCircle size={16} className="text-error flex-shrink-0" />
      )}
      <span className="text-sm text-charcoal">{label}</span>
      <span className={`text-xs ml-auto ${
        notImplemented ? "text-warning" : configured ? "text-success" : "text-error"
      }`}>
        {notImplemented ? "Not yet implemented" : configured ? "Configured" : "Not configured"}
      </span>
    </div>
  );
}
