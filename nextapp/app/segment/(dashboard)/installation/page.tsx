"use client";

import { useEffect, useMemo, useState } from "react";
import { segmentMe } from "../../../../lib/segment-api";

export default function SegmentInstallationPage() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await segmentMe();
        setApiKey(result.user.apiKey || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load API key");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const apiEndpoint = useMemo(() => {
    return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api/segment/events/track";
  }, []);

  const snippet = useMemo(() => {
    // show placeholders if key not loaded
    const key = apiKey || "{{API_KEY}}";
    const url = apiEndpoint || "{{API_ENDPOINT}}/api/segment/events/track";
    const lines: string[] = [];
    lines.push("<!-- Segment MVP tracking snippet -->");
    lines.push("<script>");
    lines.push("  (function() {");
    lines.push(`    const API_KEY = "${key}";`);
    lines.push(`    const API_URL = "${url}";`);
    lines.push("");
    lines.push("    window.analytics = {");
    lines.push("      track: function(eventName, properties, callback) {");
    lines.push("        properties = properties || {};");
    lines.push("        const storedUserId = localStorage.getItem('segment_mvp_user_id');");
    lines.push("        if (storedUserId && !properties.userId) { properties.userId = storedUserId; }");
    lines.push("");
    lines.push("        const payload = { event: eventName, userId: properties.userId || 'anonymous', properties: properties, context: { userAgent: navigator.userAgent, url: window.location.href, timestamp: new Date().toISOString() } };" );
    lines.push("" );
    lines.push("        fetch(API_URL, { method: 'POST', headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true })");
    lines.push("          .then(response => { if (response.ok && typeof callback === 'function') callback(null, response); })");
    lines.push("          .catch(error => { console.error('[Analytics] Tracking error:', error); if (typeof callback === 'function') callback(error, null); });");
    lines.push("      },");
    lines.push("      identify: function(userId, traits) { if (!userId) return; localStorage.setItem('segment_mvp_user_id', userId); this.track('identify', { userId: userId, traits: traits || {} }); },");
    lines.push("      reset: function() { localStorage.removeItem('segment_mvp_user_id'); this.track('reset', {}); },");
    lines.push("      getUserId: function() { return localStorage.getItem('segment_mvp_user_id') || null; }");
    lines.push("    };" );
    lines.push("");
    lines.push("    window.analytics.track('page_view', { url: window.location.href, title: document.title, referrer: document.referrer });");
    lines.push("");
    lines.push("    // Auto-track data-track attributes (delegated)");
    lines.push("    document.addEventListener('click', function(e) {");
    lines.push("      var target = e.target && (e.target.closest ? e.target.closest('[data-track]') : null);");
    lines.push("      if (!target) return;");
    lines.push("      var eventName = target.getAttribute('data-track');");
    lines.push("      if (!eventName) return;");
    lines.push("      var props = {};");
    lines.push("      var propsAttr = target.getAttribute('data-track-props');");
    lines.push("      if (propsAttr) { try { var parsed = JSON.parse(propsAttr); if (parsed && typeof parsed === 'object') props = parsed; } catch (err) { console.warn('[Analytics] Invalid JSON in data-track-props:', propsAttr); } }");
    lines.push("      props.elementTag = target.tagName.toLowerCase();");
    lines.push("      props.elementId = target.id || undefined;");
    lines.push("      props.elementClasses = target.className || undefined;");
    lines.push("      props.innerText = (target.innerText || '').trim().substring(0,100) || undefined;");
    lines.push("      if (target.type === 'checkbox' || target.type === 'radio') { props.checked = target.checked; props.inputValue = target.value || undefined; props.inputName = target.name || undefined; }");
    lines.push("      if (target.tagName && target.tagName.toLowerCase() === 'a' && target.href) { props.href = target.href; props.target = target.target || '_self'; }");
    lines.push("      window.analytics.track(eventName, props);");
    lines.push("    });");
    lines.push("");
    lines.push("    // Auto-track form submissions (data-track-form)");
    lines.push("    document.addEventListener('submit', function(e) {");
    lines.push("      var form = e.target;");
    lines.push("      var trackAttr = form.getAttribute && form.getAttribute('data-track-form');");
    lines.push("      if (!trackAttr) return;");
    lines.push("      var inputs = form.querySelectorAll('input, select, textarea');");
    lines.push("      var formData = {};");
    lines.push("      for (var i=0;i<inputs.length;i++){ var input = inputs[i]; if (input.name && !input.name.startsWith('password') && !input.name.startsWith('credit')) { if (input.type === 'checkbox' || input.type === 'radio') { if (input.checked) formData[input.name] = input.value || true; } else { formData[input.name] = input.value || ''; } } }");
    lines.push("      window.analytics.track(trackAttr, { formId: form.id || undefined, formName: form.name || undefined, formAction: form.action || undefined, formMethod: form.method || 'GET', formData: formData });");
    lines.push("    });");
    lines.push("");
    lines.push("    console.log('[Analytics] Tracking loaded successfully! API Key: ' + (API_KEY && API_KEY.substring ? API_KEY.substring(0,6) + '...' : ''));");
    lines.push("  })();");
    lines.push("</script>");

    return lines.join("\n");
  }, [apiKey, apiEndpoint]);

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      // eslint-disable-next-line no-alert
      alert('Snippet copied to clipboard');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Copy failed', e);
      // eslint-disable-next-line no-alert
      alert('Copy failed');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Installation</h1>
      <p className="text-sm text-gray-600">Copy this snippet into the &lt;head&gt; of your website to enable tracking.</p>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <div className="mt-1 text-sm text-gray-700">{loading ? 'Loading...' : apiKey || 'No API key available'}</div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={copySnippet} className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700">Copy Snippet</button>
          </div>
        </div>

        <pre className="overflow-x-auto rounded-md bg-gray-900 p-4 text-xs text-gray-100">{snippet}</pre>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Quick Instructions</h2>
        <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Paste the copied script into the &lt;head&gt; of your website, before the closing &lt;/head&gt; tag.</li>
          <li>Call <code>window.analytics.identify(userId)</code> after your user logs in to persist their id.</li>
          <li>Use <code>data-track</code> attributes on buttons or links to auto-track clicks. Example: <code>&lt;button data-track="signup_click"&gt;Sign up&lt;/button&gt;</code></li>
          <li>To send custom events from your app, call <code>{`window.analytics.track('event_name', { foo: 'bar' })`}</code>.</li>
          <li>Ensure your site can reach the API endpoint: <span className="font-mono">{apiEndpoint}</span></li>
        </ul>
      </div>
    </div>
  );
}
