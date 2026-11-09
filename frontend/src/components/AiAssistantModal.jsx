import React, { useState } from 'react';
import { aiApi } from '../services/api.js';
import { Bot, Sparkles, Send, X, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AiAssistantModal({ scan, isOpen, onClose }) {
  if (!isOpen || !scan) return null;

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I am **SentinelX AI Security Analyst**. I have reviewed the technical scan telemetry for **${scan.hostname}** (Risk Score: **${scan.riskScore}/100 - ${scan.riskLevel}**).\n\nAsk me any question regarding phishing indicators, cryptographic certificate posture, security headers, or defensive remediation.`,
      provider: 'SentinelX Grounded Intelligence'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Why did this website receive this risk score?',
    'Explain the TLS certificate status',
    'What remediation steps should be taken?',
    'Is it safe to enter credentials here?'
  ];

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg = { role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const resp = await aiApi.explain({
        scanData: scan,
        question: q
      });

      const assistantMsg = {
        role: 'assistant',
        text: resp.data.explanation,
        provider: resp.data.aiProvider,
        note: resp.data.note
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ Analysis query error: ${err.response?.data?.error || err.message}. Please try again.`,
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-600 shadow-glow-cyan">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-sm">SentinelX AI Security Analyst</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Grounded on Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Target: {scan.hostname}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-none'
                }`}
              >
                {/* Render clean text with line breaks */}
                <div className="whitespace-pre-line prose prose-invert prose-xs max-w-none">
                  {m.text}
                </div>

                {m.provider && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] font-mono text-cyan-400/80">
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{m.provider}</span>
                    </span>
                    {m.note && <span className="text-slate-400">{m.note}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono p-3 rounded-xl bg-slate-800/50 w-fit">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Analyzing scan evidence with Gemini AI...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/60 flex items-center space-x-2 overflow-x-auto">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI Analyst regarding this scan (e.g., 'Explain certificate error')..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
