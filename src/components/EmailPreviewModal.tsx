import React, { useState } from 'react';
import { X, Mail, Clock, Send, Laptop, Smartphone, Check, ExternalLink } from 'lucide-react';
import { NotificationLog } from '../types/academic';

interface EmailPreviewModalProps {
  notification: NotificationLog | null;
  onClose: () => void;
  onResend?: (notification: NotificationLog) => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  notification,
  onClose,
  onResend,
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  if (!notification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(notification.htmlBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(notification.timestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 truncate max-w-md">
                Email Dispatch Inspector
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>To: {notification.recipient}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport switch */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 mr-2">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  deviceView === 'desktop'
                    ? 'bg-slate-700 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Desktop view"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  deviceView === 'mobile'
                    ? 'bg-slate-700 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile view"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {onResend && (
              <button
                onClick={() => onResend(notification)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                title="Simulate dispatch again"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Resend</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Email Meta Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300 space-y-1 shrink-0 font-mono">
          <div className="flex items-baseline gap-2">
            <span className="text-slate-500 w-16">Subject:</span>
            <span className="font-semibold text-slate-200 break-all">{notification.subject}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-500 w-16">From:</span>
            <span className="text-slate-400">AcademiaPulse &lt;alerts@university-records.edu&gt;</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-500 w-16">Status:</span>
            <span className="text-emerald-400 font-semibold">{notification.status}</span>
            <span className="text-slate-500">· TLS 1.3 encrypted · Priority: Normal</span>
          </div>
        </div>

        {/* Preview Iframe Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950/90 flex justify-center items-start">
          <div
            className={`transition-all duration-300 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-800 ${
              deviceView === 'desktop' ? 'w-full max-w-2xl' : 'w-[375px]'
            }`}
            style={{ minHeight: '480px' }}
          >
            <iframe
              title="Collegiate Email Preview"
              srcDoc={notification.htmlBody}
              className="w-full h-[540px] border-none"
              sandbox="allow-same-origin allow-popups"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>Delivered via AcademiaPulse Notification Service</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
              {copied ? 'HTML Copied' : 'Copy HTML'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
