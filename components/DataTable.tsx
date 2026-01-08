
import React, { useState, useMemo } from 'react';
import { TARecord } from '../types';
import { 
  Search, ChevronRight, Activity, Target, AlertCircle, 
  Calendar, Users, FileCheck, Info, MapPin, CheckCircle2, Shield,
  Filter, Map, Building2, ClipboardList
} from 'lucide-react';

interface DataTableProps {
  records: TARecord[];
}

const getStatusColor = (status: string) => {
  if (!status) return 'bg-slate-100 text-slate-400';
  const s = status.toLowerCase();
  if (s.includes('met') || s.includes('complete') || s.includes('done') || s.includes('yes')) return 'bg-emerald-100 text-emerald-700';
  if (s.includes('not met') || s.includes('issue') || s.includes('no')) return 'bg-rose-100 text-rose-700';
  return 'bg-amber-100 text-amber-700';
};

const DataTable: React.FC<DataTableProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'targets' | 'matatag' | 'agreements' | 'signatories' | 'misc'>('targets');

  const filterOptions = useMemo(() => {
    const periods = Array.from(new Set(records.map(r => r.period))).filter(Boolean).sort();
    const districts = Array.from(new Set(records.map(r => r.district))).filter(Boolean).sort();
    const offices = Array.from(new Set(records.map(r => r.office))).filter(Boolean).sort();
    return { periods, districts, offices };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = [r.office, r.district, r.divisionSchool, r.taReceiver, r.taProvider]
        .some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPeriod = selectedPeriod === 'all' || r.period === selectedPeriod;
      const matchesDistrict = selectedDistrict === 'all' || r.district === selectedDistrict;
      const matchesOffice = selectedOffice === 'all' || r.office === selectedOffice;

      return matchesSearch && matchesPeriod && matchesDistrict && matchesOffice;
    });
  }, [records, searchTerm, selectedPeriod, selectedDistrict, selectedOffice]);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-h-[800px]">
      <div className="px-10 py-8 border-b border-slate-100 bg-white sticky top-0 z-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
              Monitoring Console
              <span className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-full tracking-tighter font-black">
                {filteredRecords.length} MATCHES
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase tracking-[0.15em] italic">Technical Assistance Oversight v4.5</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="relative group min-w-[180px]">
              <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${selectedOffice !== 'all' ? 'text-indigo-600' : 'text-slate-400'}`} size={16} />
              <select 
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
                className={`w-full pl-11 pr-8 py-3 bg-slate-50 border rounded-2xl text-[11px] font-black uppercase tracking-wider appearance-none focus:outline-none transition-all cursor-pointer ${selectedOffice !== 'all' ? 'border-indigo-200 text-indigo-700 bg-indigo-50/30' : 'border-slate-100 text-slate-500'}`}
              >
                <option value="all">All Offices</option>
                {filterOptions.offices.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="relative group min-w-[180px]">
              <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${selectedPeriod !== 'all' ? 'text-indigo-600' : 'text-slate-400'}`} size={16} />
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={`w-full pl-11 pr-8 py-3 bg-slate-50 border rounded-2xl text-[11px] font-black uppercase tracking-wider appearance-none focus:outline-none transition-all cursor-pointer ${selectedPeriod !== 'all' ? 'border-indigo-200 text-indigo-700 bg-indigo-50/30' : 'border-slate-100 text-slate-500'}`}
              >
                <option value="all">All Periods</option>
                {filterOptions.periods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="relative group min-w-[220px]">
              <Map className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${selectedDistrict !== 'all' ? 'text-indigo-600' : 'text-slate-400'}`} size={16} />
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className={`w-full pl-11 pr-8 py-3 bg-slate-50 border rounded-2xl text-[11px] font-black uppercase tracking-wider appearance-none focus:outline-none transition-all cursor-pointer ${selectedDistrict !== 'all' ? 'border-indigo-200 text-indigo-700 bg-indigo-50/30' : 'border-slate-100 text-slate-500'}`}
              >
                <option value="all">All Districts/Clusters</option>
                {filterOptions.districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-grow lg:flex-grow-0 lg:w-[250px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-14 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {(selectedPeriod !== 'all' || selectedDistrict !== 'all' || selectedOffice !== 'all' || searchTerm !== '') && (
              <button 
                onClick={() => { setSelectedPeriod('all'); setSelectedDistrict('all'); setSelectedOffice('all'); setSearchTerm(''); }}
                className="p-3 bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all"
                title="Clear Filters"
              >
                <Filter size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-auto custom-scrollbar bg-slate-50/20">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] sticky top-0 z-10 border-b border-slate-100 shadow-sm">
            <tr>
              <th className="px-10 py-6">Reporting Office</th>
              <th className="px-10 py-6">Recipient Entity</th>
              <th className="px-10 py-6">Period</th>
              <th className="px-10 py-6">Target Objectives</th>
              <th className="px-10 py-6 text-center">Verification</th>
              <th className="px-10 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            {filteredRecords.map((record) => (
              <React.Fragment key={record.id}>
                <tr 
                  onClick={() => setSelectedRow(selectedRow === record.id ? null : record.id)}
                  className={`group cursor-pointer transition-all ${selectedRow === record.id ? 'bg-indigo-50/50' : 'hover:bg-white'}`}
                >
                  <td className="px-10 py-7">
                    <span className="text-[13px] font-black text-indigo-900 leading-tight block mb-1">{record.office}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{record.district || 'Regional Unit'}</span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-900/10">
                        <MapPin size={14} />
                      </div>
                      <span className="text-[12px] font-black text-slate-700 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm block truncate max-w-[250px]">
                        {record.divisionSchool}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className={`flex items-center gap-2 ${record.period === selectedPeriod ? 'text-indigo-600' : 'text-slate-500'}`}>
                      <Calendar size={14} className={record.period === selectedPeriod ? 'text-indigo-600' : 'text-indigo-400'} />
                      <span className="text-[11px] font-black uppercase tracking-tight">{record.period}</span>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Target size={14} className="text-indigo-500" />
                        <span className="text-[11px] font-black text-slate-900 uppercase">{record.targets.length} Total Targets</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full transition-all duration-500" 
                          style={{ width: `${(record.targets.filter(t => t.status.toLowerCase().includes('met') || t.status.toLowerCase().includes('complete')).length / (record.targets.length || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <div className="flex justify-center gap-1.5">
                      {[
                        record.targets.length > 0, 
                        record.agreements.length > 0, 
                        record.receiverSignatories.length > 0,
                        record.access.length > 0
                      ].map((v, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${v ? 'bg-indigo-600 shadow-sm' : 'bg-slate-200'}`}></div>
                      ))}
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${selectedRow === record.id ? 'bg-indigo-600 text-white rotate-90 scale-110 shadow-xl' : 'text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50'}`}>
                      <ChevronRight size={22} />
                    </div>
                  </td>
                </tr>

                {selectedRow === record.id && (
                  <tr>
                    <td colSpan={6} className="p-0 border-y border-slate-200">
                      <div className="bg-white/95 backdrop-blur-3xl p-12">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-10 border-b border-slate-100 pb-10">
                          <div className="flex gap-8 items-center">
                            <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shadow-3xl shadow-slate-900/20">
                              <Shield size={40} />
                            </div>
                            <div>
                              <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{record.divisionSchool}</h4>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">{record.district}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{record.office}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {record.reasons.map((r, idx) => (
                              <span key={idx} className="bg-rose-50 text-rose-600 text-[10px] font-black px-5 py-2.5 rounded-full border border-rose-100 flex items-center gap-2">
                                <AlertCircle size={12} />
                                REASON: {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-4 mb-10 bg-slate-100 p-2 rounded-[2rem] w-fit border border-slate-200 overflow-x-auto max-w-full no-scrollbar">
                          {[
                            { id: 'targets', label: 'Technical Objectives', icon: Target },
                            { id: 'matatag', label: 'Operational (MATATAG)', icon: Activity },
                            { id: 'agreements', label: 'Commitments & Follow-up', icon: CheckCircle2 },
                            { id: 'signatories', label: 'Verification (Signatories)', icon: Users },
                            { id: 'misc', label: 'System Intel', icon: Info },
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 border border-indigo-200' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                              <tab.icon size={14} />
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                          {activeTab === 'targets' && (
                            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-900/5">
                              <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-900 text-[9px] text-slate-400 font-black uppercase tracking-[0.25em]">
                                  <tr>
                                    <th className="px-8 py-6 w-16">#</th>
                                    <th className="px-8 py-6">Objective of the Target Recipient</th>
                                    <th className="px-8 py-6">Planned Action</th>
                                    <th className="px-8 py-6">Target Due Date</th>
                                    <th className="px-8 py-6">Status Completion</th>
                                    <th className="px-8 py-6">Help Needed</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {record.targets.length > 0 ? record.targets.map((target, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-8 py-6">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                                          {idx + 1}
                                        </div>
                                      </td>
                                      <td className="px-8 py-6">
                                        <p className="text-[13px] font-black text-slate-900 leading-snug">{target.objective}</p>
                                      </td>
                                      <td className="px-8 py-6">
                                        <p className="text-[12px] text-slate-600 font-medium leading-relaxed">{target.plannedAction || '---'}</p>
                                      </td>
                                      <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-indigo-600">
                                          <Calendar size={12} />
                                          <span className="text-[11px] font-black uppercase">{target.dueDate || 'N/A'}</span>
                                        </div>
                                      </td>
                                      <td className="px-8 py-6">
                                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter ${getStatusColor(target.status)}`}>
                                          {target.status || 'Pending'}
                                        </span>
                                      </td>
                                      <td className="px-8 py-6">
                                        <div className="flex items-start gap-2 max-w-[200px]">
                                          <Info size={12} className="text-slate-400 mt-1 shrink-0" />
                                          <p className="text-[11px] text-slate-500 font-medium italic">{target.helpNeeded || 'No assistance requested.'}</p>
                                        </div>
                                      </td>
                                    </tr>
                                  )) : (
                                    <tr>
                                      <td colSpan={6} className="px-10 py-32 text-center text-slate-300 font-black uppercase tracking-widest text-sm">
                                        No Technical Targets Specified for this intervention.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {activeTab === 'matatag' && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                              {[
                                { name: 'Access', data: record.access, color: 'teal' },
                                { name: 'Equity', data: record.equity, color: 'indigo' },
                                { name: 'Quality', data: record.quality, color: 'rose' },
                                { name: 'Resilience', data: record.resilience, color: 'amber' },
                                { name: 'Enabling', data: record.enabling, color: 'purple' }
                              ].map((cat) => (
                                <div key={cat.name} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-500/5">
                                  <h5 className={`text-[11px] font-black uppercase tracking-[0.25em] text-${cat.color}-600 mb-8 flex items-center justify-between`}>
                                    {cat.name}
                                    <div className={`w-2.5 h-2.5 rounded-full bg-${cat.color}-500 shadow-sm`}></div>
                                  </h5>
                                  <div className="space-y-6">
                                    {cat.data.map((item, idx) => (
                                      <div key={idx} className="pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full mb-3 inline-block ${getStatusColor(item.status)}`}>
                                          {item.status}
                                        </span>
                                        <p className="text-[12px] font-medium text-slate-600 leading-relaxed italic whitespace-pre-line">
                                          {item.issue || 'Operational baseline normal.'}
                                        </p>
                                      </div>
                                    ))}
                                    {cat.data.length === 0 && <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center py-10">No records found</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {activeTab === 'agreements' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                              {record.agreements.length > 0 ? record.agreements.map((a, idx) => (
                                <div key={idx} className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-xl shadow-indigo-900/5">
                                  <div className="bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black mb-6 shadow-lg shadow-indigo-600/20">{idx+1}</div>
                                  <h6 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-4">Agreed Follow-up</h6>
                                  <p className="text-[13px] font-black text-slate-900 mb-6 leading-snug">{a.agree}</p>
                                  <div className="space-y-4 pt-6 border-t border-indigo-100/50">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Office Responsible</span>
                                      <span className="text-[11px] text-indigo-900 font-black">{a.specificOffice || '---'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Target Date</span>
                                      <span className="text-[11px] text-slate-900 font-black">{a.dueDate || '---'}</span>
                                    </div>
                                  </div>
                                </div>
                              )) : (
                                <div className="col-span-5 text-center py-32 bg-slate-50 rounded-[3rem] text-slate-300 font-black uppercase text-sm tracking-[0.3em]">No post-intervention agreements recorded.</div>
                              )}
                            </div>
                          )}

                          {activeTab === 'signatories' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                              <div>
                                <h5 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><FileCheck size={20} /></div>
                                  Receiver Signatories
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {record.receiverSignatories.map((sig, idx) => (
                                    <div key={idx} className="flex items-center gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-500/5">
                                      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-black text-sm shrink-0">{idx+1}</div>
                                      <div>
                                        <p className="text-[13px] font-black text-slate-900 leading-tight">{sig.name}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight mt-1">{sig.position}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {record.receiverSignatories.length === 0 && <p className="col-span-2 text-center py-20 text-slate-300 font-black uppercase text-[10px]">No names on record</p>}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><Users size={20} /></div>
                                  Provider Signatories
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {record.providerSignatories.map((sig, idx) => (
                                    <div key={idx} className="flex items-center gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-500/5">
                                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm shrink-0">{idx+1}</div>
                                      <div>
                                        <p className="text-[13px] font-black text-slate-900 leading-tight">{sig.name}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight mt-1">{sig.position}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {record.providerSignatories.length === 0 && <p className="col-span-2 text-center py-20 text-slate-300 font-black uppercase text-[10px]">No names on record</p>}
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'misc' && (
                            <div className="bg-slate-900 p-12 rounded-[4rem] text-white">
                              <div className="flex items-center gap-4 mb-12">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400"><Info size={24} /></div>
                                <h5 className="text-xl font-black uppercase tracking-widest">Registry Sync Intelligence</h5>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                                <div>
                                  <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Technical Registry Dates</h6>
                                  <div className="space-y-6">
                                    <div>
                                      <p className="text-[9px] text-teal-400 font-black uppercase mb-1">Dept Team Verified</p>
                                      <p className="text-sm font-bold">{record.misc.deptTeamDate || '---'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-teal-400 font-black uppercase mb-1">TA Team Finalized</p>
                                      <p className="text-sm font-bold">{record.misc.taTeamDate || '---'}</p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Extended Personnel (Rep 4)</h6>
                                  <div className="space-y-2">
                                    <p className="text-sm font-bold">{record.misc.taName4 || '---'}</p>
                                    <p className="text-[10px] text-slate-400 italic font-medium">{record.misc.taPosition4}</p>
                                  </div>
                                </div>
                                <div>
                                  <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Extended Personnel (Rep 5)</h6>
                                  <div className="space-y-2">
                                    <p className="text-sm font-bold">{record.misc.taName5 || '---'}</p>
                                    <p className="text-[10px] text-slate-400 italic font-medium">{record.misc.taPosition5}</p>
                                  </div>
                                </div>
                                <div>
                                  <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Administrative Hierarchy</h6>
                                  <div className="space-y-2">
                                    <p className="text-sm font-bold text-indigo-400 truncate">{record.office}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black">{record.district}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center gap-4 text-slate-300">
                    <Search size={48} className="opacity-20" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">No matching records found in this view</p>
                    <button 
                      onClick={() => { setSelectedPeriod('all'); setSelectedDistrict('all'); setSelectedOffice('all'); setSearchTerm(''); }}
                      className="mt-4 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-12 py-6 bg-white border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
        <div className="flex gap-10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${filteredRecords.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            <span>{filteredRecords.length} Clean Records Processed</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-indigo-600">
          <Activity size={14} />
          <span>Technical Assistance Division - Precision Data Engine</span>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
