// #4471 split into its problems, counted the way the desk counts (CauseTable): each report under
// its cause by tenant (causes.ts). The desk's one-day moves (desk-notes.json) stay counted where
// they are filed and are shown as their own problem beside it, as CauseTable footnotes them.
import { groupByCause, readAs, uniqueById, type CauseGroup, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

// `shift`: the date moved by one day, or differs between timezones. Not a day/month swap.
export type Problem = CauseGroup['cause'] | 'shift';

export type ProblemRow = {
  problem: Problem;
  reports: number;
  // For `shift`: the cause these reports are counted under.
  within?: CauseGroup['cause'];
  tenants: number;
  // Reports intake tagged as something other than their cause.
  mistagged: number;
  firstSeen: string;
  lastSeen: string;
};

export function splitTicket(all: Report[], ticket: number, shiftIds: readonly string[]): ProblemRow[] {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const rows: ProblemRow[] = [];
  for (const g of groupByCause(merged, tenantOf)) {
    rows.push({
      problem: g.cause,
      reports: g.reports.length,
      tenants: g.tenants,
      mistagged: g.reports.filter((r) => r.meta.intakeTag !== g.cause).length,
      firstSeen: g.firstSeen,
      lastSeen: g.lastSeen,
    });
    if (!readAs(g, shiftIds)) continue;
    const moved = g.reports.filter((r) => shiftIds.includes(r.id));
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    rows.push({
      problem: 'shift',
      reports: moved.length,
      within: g.cause,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      mistagged: moved.filter((r) => r.meta.intakeTag !== 'shift').length,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
    });
  }
  return rows;
}
