'use client';

import React from 'react';
import { ShieldCheck, Clock, FileText, User } from 'lucide-react';
import { AuditActionLog } from './types';

interface AuditLogsViewerProps {
  logs: AuditActionLog[];
}

export default function AuditLogsViewer({ logs }: AuditLogsViewerProps) {
  return (
    <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
        <div>
          <h3 className="font-serif font-black text-neutral-900 text-lg flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <span>Immutable Front Desk Audit Trail</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Cryptographically timestamped action logs for price edits, room states, emergency locks, and shift balances.
          </p>
        </div>
        <span className="text-[10px] font-mono bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full">
          Total Logs: {logs.length}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="py-10 text-center text-neutral-400 text-xs">
          No audit action logs recorded yet. Front desk operations will be recorded here automatically.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-50 text-amber-950 uppercase font-bold text-[10px] tracking-wider border-b border-amber-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700 font-sans">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-amber-50/30">
                  <td className="py-3 px-3 font-mono text-[10px] text-neutral-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-bold text-neutral-900 whitespace-nowrap">
                    {log.operatorName}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      log.module === 'Security & Auth'
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : log.module === 'Shift Balance'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-neutral-800">
                    <span className={log.action.includes('LOCK') || log.action.includes('LOGOUT') ? 'text-amber-800' : ''}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-600">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
