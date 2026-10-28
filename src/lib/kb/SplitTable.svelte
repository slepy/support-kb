<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { splitTicket, type Problem } from '#lib/kb/split';

  // tickets: where each problem is filed now, and what engineering did with it.
  type Filed = { href: string; state: string };
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, Filed>> } = $props();

  const rows = $derived((reports as Report[]).length);
  const unique = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  const split = $derived(splitTicket(reports as Report[], ticket, notes.oneDayMove));
  const ref = (href: string) => href.replace(/^https:\/\/github\.com\/(.+)\/issues\/(\d+)$/, '$1#$2');
</script>

<p class="sum">
  <strong>{unique}</strong> reports in #{ticket} ({rows} rows in the export, {rows - unique} of them repeats) ·
  <strong>{split.length}</strong>
  {split.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>intake tagged otherwise</th><th>seen</th><th>ticket</th><th>state</th></tr>
  </thead>
  <tbody>
    {#each split as p (p.problem)}
      {@const filed = tickets[p.problem]}
      <tr class:within={p.within} class:open={!filed || filed.state === 'open'}>
        <td><code>{p.problem}</code></td>
        <td>{p.reports}{#if p.within}<span class="sub"> of the {p.within} count</span>{/if}</td>
        <td>{p.tenants}</td>
        <td>{p.mistagged}</td>
        <td class="sub">{p.firstSeen} → {p.lastSeen}</td>
        <td>{#if filed}<a href={filed.href}>{ref(filed.href)}</a>{:else}no ticket yet{/if}</td>
        <td>{filed?.state ?? '—'}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .sub { color: var(--muted); font-size: 0.85em; }
  .within td:first-child { padding-left: 1.25rem; }
  .open td { background: var(--warn-bg); }
  .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
