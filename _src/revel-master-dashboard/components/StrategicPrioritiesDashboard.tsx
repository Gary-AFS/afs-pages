import React, { useState, useEffect } from 'react';
import { Flag, Loader2 } from 'lucide-react';

const ASANA_PROJECT_GID = "1213307020658494";
// Asana PAT is held server-side in the asana-api-proxy Worker; the client never sees it.
const ASANA_PROXY = "https://asana-api-proxy.josh-03c.workers.dev";

async function fetchAsanaInitiatives(): Promise<any[]> {
    const secRes = await fetch(`${ASANA_PROXY}/projects/${ASANA_PROJECT_GID}/sections`);
    if (!secRes.ok) throw new Error("Failed to fetch sections");
    const revelSection = (await secRes.json()).data.find((s: any) => s.name.toUpperCase().includes("REVEL"));
    if (!revelSection) throw new Error("REVEL section not found");

    const tasksRes = await fetch(`${ASANA_PROXY}/sections/${revelSection.gid}/tasks?opt_fields=name,completed,due_on,assignee.name,permalink_url,custom_fields,parent,parent.name`);
    if (!tasksRes.ok) throw new Error("Failed to fetch tasks");
    const tasks = (await tasksRes.json()).data;

    return Promise.all(tasks.map(async (task: any) => {
        const subRes = await fetch(`${ASANA_PROXY}/tasks/${task.gid}/subtasks?opt_fields=name,completed,due_on,due_at`);
        const subtasks = subRes.ok ? (await subRes.json()).data : [];

        let completed = 0, hasOverdueSubtask = false;
        const now = new Date();
        subtasks.forEach((st: any) => {
            if (st.completed) completed++;
            else if ((st.due_on || st.due_at) && new Date(st.due_at || st.due_on) < now) hasOverdueSubtask = true;
        });

        const cf = task.custom_fields || [];
        const priorityStatus = cf.find((f: any) => f.name === "STRATEGIC PRIORITY STATUS" || f.name.toLowerCase().includes("status"))?.display_value || "";
        const sprint = cf.find((f: any) => f.name === "Sprint" || f.name.toLowerCase().includes("sprint"))?.display_value || "";

        return {
            gid: task.gid,
            name: task.name,
            assigneeName: task.assignee?.name || "",
            permalink_url: task.permalink_url,
            priorityStatus,
            sprint,
            parentName: task.parent?.name || null,
            totalSubtasks: subtasks.length,
            completedSubtasks: completed,
            progress: subtasks.length === 0 ? 0 : Math.round(completed / subtasks.length * 100),
            hasOverdueSubtask,
        };
    }));
}

export default function StrategicPrioritiesDashboard() {
    const [asanaTasks, setAsanaTasks] = useState<any[]>([]);
    const [isAsanaLoading, setIsAsanaLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setAsanaTasks(await fetchAsanaInitiatives());
            } catch (err) {
                console.error("Asana fetch failed", err);
            } finally {
                setIsAsanaLoading(false);
            }
        })();
    }, []);

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('track') && !s.includes('off')) return 'bg-[#8ce0a4] text-emerald-900';
        if (s.includes('risk')) return 'bg-yellow-200 text-yellow-900';
        if (s.includes('off') || s.includes('urgent') || s.includes('high')) return 'bg-[#fba49b] text-red-900';
        return 'bg-gray-200 text-gray-700';
    };

    return (
        <div className="min-h-screen bg-[#f8f8fa] font-sans pb-20 animate-in fade-in duration-500">
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
                <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#dce5d4] rounded-xl text-[#485D4D]">
                            <Flag size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-900">Strategic Priorities</h1>
                            <p className="text-xs text-gray-500 font-medium">Real-time sync from Asana</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-4 md:p-6 mt-4">
                <div className="mb-4">
                    <h2 className="text-sm font-bold tracking-widest text-gray-800 uppercase">Current Quarter Priorities</h2>
                    {!isAsanaLoading && (
                        <p className="text-xs text-gray-500 mt-1">{asanaTasks.length} {asanaTasks.length === 1 ? 'priority' : 'priorities'}</p>
                    )}
                </div>

                {isAsanaLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 shadow-sm mt-8">
                        <Loader2 className="w-8 h-8 text-[#485D4D] animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading initiatives from Asana...</p>
                    </div>
                ) : asanaTasks.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm text-center text-gray-500 mt-4">
                        No active initiatives found in the REVEL section.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {asanaTasks.map((task) => {
                            const isComplete = task.progress === 100;
                            const barColor = isComplete ? 'bg-[#34a853]' : (task.hasOverdueSubtask ? 'bg-[#D1493B]' : 'bg-[#34a853]');

                            return (
                                <div key={task.gid} className="bg-white rounded-[6px] shadow-sm border border-[#e8e8e9] p-4 transition-all hover:bg-gray-50/50 flex flex-col gap-3 group relative">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                                            <div className="text-gray-300 group-hover:text-gray-400 cursor-grab px-1 hidden md:block">
                                                <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="3" cy="3" r="1.5" /><circle cx="3" cy="8" r="1.5" /><circle cx="3" cy="13" r="1.5" />
                                                    <circle cx="9" cy="3" r="1.5" /><circle cx="9" cy="8" r="1.5" /><circle cx="9" cy="13" r="1.5" />
                                                </svg>
                                            </div>

                                            <div className="w-8 h-8 rounded-full bg-[#dce5d4] text-[#485D4D] flex items-center justify-center text-xs font-bold shrink-0 mt-1 md:mt-0" title={task.assigneeName}>
                                                {task.assigneeName ? (task.assigneeName.includes(' ') ? task.assigneeName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : task.assigneeName.substring(0, 2)).toUpperCase() : '??'}
                                            </div>

                                            <div className="flex-1 pr-0 md:pr-6 flex flex-col justify-center min-w-0">
                                                <h4 className="text-[#1e1f21] font-medium text-[14px] leading-tight mb-2 truncate whitespace-normal break-words">{task.name}</h4>

                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#dce5d4] text-[#2f3529] text-[10px] uppercase font-bold tracking-widest w-max leading-none">
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                                        Company Priority
                                                    </div>
                                                    {task.priorityStatus && (
                                                        <div className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium leading-none ${getStatusColor(task.priorityStatus)}`}>
                                                            {task.priorityStatus}
                                                        </div>
                                                    )}
                                                    {task.sprint && (
                                                        <div className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium leading-none bg-[#ABB99C] text-[#2f3529]">
                                                            {task.sprint}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-56 flex flex-col justify-center shrink-0">
                                            <div className="flex items-center justify-between w-full mb-1.5">
                                                <div className="px-2 py-[3px] bg-[#6d6e6f] text-white rounded-full text-[9px] font-bold tracking-widest uppercase leading-none">Rollup</div>
                                                <div className="text-[#1e1f21] font-bold text-sm">{task.progress}%</div>
                                            </div>
                                            <div className="w-full h-3 bg-[#e8e8e9] overflow-hidden" style={{ borderRadius: '3px' }}>
                                                <div className={`h-full ${barColor} transition-all duration-500 ease-out`} style={{ width: `${task.progress}%` }} />
                                            </div>
                                        </div>

                                        {task.permalink_url ? (
                                            <a href={task.permalink_url} target="_blank" rel="noopener noreferrer" className="self-end md:self-center ml-auto md:ml-2 text-gray-400 hover:text-[#485D4D] p-2 rounded hover:bg-[#dce5d4]/50 transition-colors" title="View in Asana">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                            </a>
                                        ) : (
                                            <div className="self-end md:self-center ml-auto md:ml-2 text-gray-300 p-2">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                                            </div>
                                        )}
                                    </div>

                                    {task.parentName && (
                                        <div className="pl-0 md:pl-[3.25rem] mt-1 pr-0 md:pr-[280px]">
                                            <div className="flex items-start gap-1.5 text-[11px] text-gray-500 leading-snug bg-gray-50 p-2 rounded-md border border-gray-100">
                                                <svg className="shrink-0 mt-[1.5px] text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>
                                                <span className="truncate whitespace-normal break-words">
                                                    <span className="font-semibold text-gray-600 mr-1">Annual Initiative:</span>
                                                    {task.parentName}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
