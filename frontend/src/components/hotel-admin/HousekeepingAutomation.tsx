'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Camera,
  UploadCloud,
  Clock,
  Wrench,
  User,
  ShieldCheck,
  CheckSquare,
  Square,
  Plus,
  Send,
  Trash2,
  Flame,
  ArrowRight
} from 'lucide-react';
import { HousekeepingTask, MaintenanceTicket, PMSRoom } from './types';

interface HousekeepingAutomationProps {
  tasks: HousekeepingTask[];
  tickets: MaintenanceTicket[];
  rooms: PMSRoom[];
  operatorName: string;
  onUpdateChecklist: (taskId: string, key: keyof HousekeepingTask['checklist'], value: boolean) => void;
  onSubmitPhotoAndVerify: (taskId: string, photoUrl: string) => void;
  onCreateMaintenanceTicket: (ticket: MaintenanceTicket) => void;
  onResolveTicket: (ticketId: string) => void;
  onLogAudit: (action: string, module: 'Front Desk' | 'Tape Chart' | 'Housekeeping' | 'POS & Billing' | 'Shift Balance', details: string) => void;
}

export default function HousekeepingAutomation({
  tasks,
  tickets,
  rooms,
  operatorName,
  onUpdateChecklist,
  onSubmitPhotoAndVerify,
  onCreateMaintenanceTicket,
  onResolveTicket,
  onLogAudit
}: HousekeepingAutomationProps) {
  const [activeTab, setActiveTab] = useState<'cleaning_tasks' | 'maintenance_desk'>('cleaning_tasks');

  // Photo Verification Modal State
  const [activePhotoModalTask, setActivePhotoModalTask] = useState<HousekeepingTask | null>(null);
  const [samplePhoto, setSamplePhoto] = useState<string>('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80');

  // New Maintenance Ticket Form Modal
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketData, setNewTicketData] = useState<{
    roomNumber: string;
    category: MaintenanceTicket['category'];
    description: string;
    urgency: MaintenanceTicket['urgency'];
    assignedTechnician: string;
  }>({
    roomNumber: rooms[0]?.roomNumber || '101',
    category: 'AC / Climate',
    description: '',
    urgency: 'Urgent',
    assignedTechnician: 'Mukesh Sharma (Sr. Technician)'
  });

  const pendingTasks = tasks.filter(t => t.status !== 'INSPECTED_CLEAN');
  const completedTasks = tasks.filter(t => t.status === 'INSPECTED_CLEAN');
  const openTickets = tickets.filter(t => t.status !== 'Resolved');

  // Handle Photo Submission
  const handlePhotoGateConfirm = () => {
    if (!activePhotoModalTask) return;
    onSubmitPhotoAndVerify(activePhotoModalTask.id, samplePhoto);
    setActivePhotoModalTask(null);
  };

  // Handle New Ticket Submission
  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket: MaintenanceTicket = {
      id: `tkt-${Date.now()}`,
      roomNumber: newTicketData.roomNumber,
      category: newTicketData.category,
      description: newTicketData.description || 'Routine maintenance and inspection requested',
      urgency: newTicketData.urgency,
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assignedTechnician: newTicketData.assignedTechnician,
      status: 'Open'
    };
    onCreateMaintenanceTicket(ticket);
    setShowNewTicketModal(false);
    setNewTicketData({
      roomNumber: rooms[0]?.roomNumber || '101',
      category: 'AC / Climate',
      description: '',
      urgency: 'Urgent',
      assignedTechnician: 'Mukesh Sharma (Sr. Technician)'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-neutral-900 to-amber-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Module 3 • Housekeeping &amp; Maintenance Automation</span>
              <span className="text-emerald-500">•</span>
              <span className="text-amber-300 font-mono">-40% Room Turnover Time</span>
            </div>
            <h2 className="text-2xl font-serif font-black text-white">
              Smart Cleaning &amp; Facility Ticketing
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
              Auto-dispatches room cleaning on checkout, enforces itemized mobile sanitization checklists, verifies via photo proof, and dispatches urgent facility tickets.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('cleaning_tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'cleaning_tasks'
                  ? 'bg-emerald-500 text-neutral-950 shadow-lg'
                  : 'bg-emerald-900/60 hover:bg-emerald-800 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Cleaning Queue ({pendingTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('maintenance_desk')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'maintenance_desk'
                  ? 'bg-amber-500 text-neutral-950 shadow-lg'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Maintenance Desk ({openTickets.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CLEANING CHECKLIST & PHOTO VERIFICATION */}
      {activeTab === 'cleaning_tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif font-black text-neutral-900 text-lg">
                Active Cleaning Tasks ({pendingTasks.length} Pending)
              </h3>
              <p className="text-xs text-neutral-500">
                Tasks auto-dispatched by Front Desk checkouts. Complete checklist and upload photo to release room.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              ✓ {completedTasks.length} Rooms Cleaned Today
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-amber-200 text-neutral-400">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
              <span className="font-bold text-neutral-700 text-xs block">All Rooms Sanitized &amp; Inspected</span>
              <span className="text-[11px] text-neutral-500">Checking out a guest at the Front Desk will auto-dispatch cleaning here.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map(task => {
                const allChecked = Object.values(task.checklist).every(Boolean);

                return (
                  <div
                    key={task.id}
                    className={`rounded-3xl p-6 border transition flex flex-col justify-between ${
                      task.status === 'INSPECTED_CLEAN'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-white border-amber-200 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Task Header */}
                      <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-lg text-neutral-900">
                              Room {task.roomNumber}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                              Floor {task.floor}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 block mt-0.5">
                            Assigned: <strong className="text-neutral-800">{task.assignedStaff}</strong> • Dispatched: {task.dispatchedAt}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            task.status === 'INSPECTED_CLEAN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'PHOTO_SUBMITTED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800 animate-pulse'
                          }`}
                        >
                          {task.status === 'INSPECTED_CLEAN'
                            ? '● Inspected Clean'
                            : task.status === 'PHOTO_SUBMITTED'
                            ? '● Photo Uploaded'
                            : '● Dirty (Turnover)'}
                        </span>
                      </div>

                      {/* Itemized Mobile Cleaning Checklist */}
                      <div className="mt-4 space-y-2.5 text-xs">
                        <span className="text-[11px] font-bold text-neutral-700 block uppercase tracking-wider">
                          Mobile Sanitization Checklist:
                        </span>

                        {[
                          { key: 'linenBedding', label: 'Fresh linen, pillows & mattress steam-pressed' },
                          { key: 'bathroomSanitized', label: 'Bathroom scrubbed, anti-slip tiles disinfected' },
                          { key: 'satvikAmenities', label: 'Satvik soap, fresh towels & Ganga jal restocked' },
                          { key: 'acGeyserInspected', label: 'AC cooling & instant geyser hot water tested' },
                          { key: 'floorCleaned', label: 'Floors mopped & sacred chandan fragrance applied' }
                        ].map(item => {
                          const isChecked = task.checklist[item.key as keyof HousekeepingTask['checklist']];

                          return (
                            <button
                              key={item.key}
                              disabled={task.status === 'INSPECTED_CLEAN'}
                              onClick={() =>
                                onUpdateChecklist(
                                  task.id,
                                  item.key as keyof HousekeepingTask['checklist'],
                                  !isChecked
                                )
                              }
                              className="w-full flex items-center space-x-2.5 text-left p-2 rounded-xl hover:bg-neutral-50 transition"
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-neutral-300 shrink-0" />
                              )}
                              <span className={isChecked ? 'text-neutral-800 font-semibold' : 'text-neutral-500'}>
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Photo Verification Gate Trigger */}
                    <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      {task.status === 'INSPECTED_CLEAN' ? (
                        <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Room Ready &amp; Live on Front Desk Inventory</span>
                        </div>
                      ) : (
                        <button
                          disabled={!allChecked}
                          onClick={() => setActivePhotoModalTask(task)}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center space-x-2"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Photo Verification Gate → Mark Clean</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: URGENCY-TAGGED MAINTENANCE DESK */}
      {activeTab === 'maintenance_desk' && (
        <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="font-serif font-black text-neutral-900 text-lg flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-amber-700" />
                <span>Urgency-Tagged Facility Ticketing Desk</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Log AC, plumbing, electrical, and carpentry issues with live urgency triage.
              </p>
            </div>

            <button
              onClick={() => setShowNewTicketModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Maintenance Ticket</span>
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="py-12 text-center text-neutral-400">
              <Wrench className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
              <span className="font-bold text-neutral-700 text-xs block">Zero Open Maintenance Tickets</span>
              <span className="text-[11px] text-neutral-500">All electricals, geysers, and room air-conditioners are operating normally.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50 text-amber-950 uppercase font-bold text-[10px] tracking-wider border-b border-amber-200">
                  <tr>
                    <th className="py-3 px-4">Room #</th>
                    <th className="py-3 px-4">Urgency Tag</th>
                    <th className="py-3 px-4">Category &amp; Issue</th>
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-4">Reported</th>
                    <th className="py-3 px-4">Status &amp; Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-amber-50/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        Room {ticket.roomNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center space-x-1 w-max ${
                            ticket.urgency === 'Urgent'
                              ? 'bg-rose-100 text-rose-900 font-black animate-pulse'
                              : ticket.urgency === 'High'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          {ticket.urgency === 'Urgent' && <Flame className="w-3 h-3 text-rose-600" />}
                          <span>{ticket.urgency}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-neutral-900 block">{ticket.category}</span>
                        <span className="text-[11px] text-neutral-500">{ticket.description}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">{ticket.assignedTechnician}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500">{ticket.reportedAt}</td>
                      <td className="py-3.5 px-4">
                        {ticket.status === 'Resolved' ? (
                          <span className="text-emerald-700 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onResolveTicket(ticket.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition"
                          >
                            Mark Fixed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PHOTO VERIFICATION MODAL GATE */}
      {activePhotoModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-emerald-200 space-y-4">
            <button
              onClick={() => setActivePhotoModalTask(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-neutral-900 text-lg">
                Photo Verification Gate
              </h3>
              <p className="text-xs text-neutral-500">
                Supervisor proof for <strong className="text-neutral-900">Room {activePhotoModalTask.roomNumber}</strong>. Status flips to Inspected &amp; Clean upon approval.
              </p>
            </div>

            {/* Proof Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-neutral-200 relative aspect-video bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={samplePhoto}
                alt="Room cleaning verification photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                Captured: {new Date().toLocaleTimeString()} • Geo-tag: Braj Dham
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-xs flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                All 5 sanitization checklist parameters satisfied by {activePhotoModalTask.assignedStaff}.
              </span>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setActivePhotoModalTask(null)}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs"
              >
                Reject / Retake
              </button>
              <button
                onClick={handlePhotoGateConfirm}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow"
              >
                Approve &amp; Release Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MAINTENANCE TICKET MODAL */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-amber-200 space-y-4">
            <button
              onClick={() => setShowNewTicketModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              ✕
            </button>

            <h3 className="font-serif font-black text-neutral-900 text-lg">
              Dispatch Facility Maintenance Ticket
            </h3>
            <p className="text-xs text-neutral-500">
              Notify technicians for rapid room repairs.
            </p>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-600 font-semibold block mb-1">Room #</label>
                  <select
                    value={newTicketData.roomNumber}
                    onChange={e => setNewTicketData({ ...newTicketData, roomNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold bg-white text-neutral-900"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.roomNumber}>
                        Room {r.roomNumber} (Floor {r.floor})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-600 font-semibold block mb-1">Urgency Tag</label>
                  <select
                    value={newTicketData.urgency}
                    onChange={e => setNewTicketData({ ...newTicketData, urgency: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold bg-white text-neutral-900"
                  >
                    <option value="Urgent">🚨 Urgent (Immediate)</option>
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-600 font-semibold block mb-1">Category</label>
                <select
                  value={newTicketData.category}
                  onChange={e => setNewTicketData({ ...newTicketData, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold bg-white text-neutral-900"
                >
                  <option value="AC / Climate">AC / Climate Control</option>
                  <option value="Plumbing / Geyser">Plumbing / Hot Water Geyser</option>
                  <option value="Electrical">Electrical / Lighting</option>
                  <option value="Locks / Keycard">Locks / Smart Keycard</option>
                  <option value="Carpentry">Carpentry &amp; Furniture</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-600 font-semibold block mb-1">Issue Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Geyser tripping circuit breaker or water pressure low"
                  value={newTicketData.description}
                  onChange={e => setNewTicketData({ ...newTicketData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow"
                >
                  Dispatch Ticket to Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
