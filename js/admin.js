let adminToken = '';
let adminRole = '';
let latestReport = [];
const loginPanel = document.getElementById('adminLoginPanel');
const toolsPanel = document.getElementById('adminTools');
function msg(id, text, ok=false) { const el = document.getElementById(id); el.textContent = text; el.className = 'message' + (ok ? ' success' : ''); }
document.getElementById('adminLoginForm').addEventListener('submit', async e => {
  e.preventDefault(); msg('loginMessage', 'Signing in…');
  try {
    const r = await api('adminLogin', { adminEmail: document.getElementById('adminEmail').value.trim(), adminPassphrase: document.getElementById('adminPassphrase').value });
    adminToken = r.token; adminRole = r.role;
    loginPanel.classList.add('hidden'); toolsPanel.classList.remove('hidden');
    if (adminRole !== 'ADMIN') document.getElementById('resetForm').classList.add('hidden');
    await loadReport();
  } catch (err) { msg('loginMessage', err.message); }
});
document.getElementById('resetForm').addEventListener('submit', async e => {
  e.preventDefault(); msg('resetMessage', 'Resetting password…');
  try {
    const r = await api('resetStudentPassword', { token: adminToken, enrollmentNo: document.getElementById('resetEnrollment').value.trim() });
    msg('resetMessage', r.message, true);
  } catch (err) { msg('resetMessage', err.message); }
});
async function loadReport() {
  const body = document.getElementById('reportBody'); body.replaceChildren();
  try {
    latestReport = await api('getVerificationReport', { token: adminToken });
    if (!latestReport.length) { body.innerHTML = '<tr><td colspan="5">No active students found.</td></tr>'; return; }
    latestReport.forEach(r => {
      const tr = document.createElement('tr');
      [r.enrollmentNo, r.studentName, r.course, r.status, r.correctionRemarks].forEach(v => {
        const td = document.createElement('td'); td.textContent = v || ''; tr.append(td);
      }); body.append(tr);
    });
  } catch (err) { body.textContent = err.message; }
}
document.getElementById('refreshReport').addEventListener('click', loadReport);
document.getElementById('adminLogout').addEventListener('click', () => { adminToken=''; adminRole=''; toolsPanel.classList.add('hidden'); loginPanel.classList.remove('hidden'); });
document.getElementById('exportCsv').addEventListener('click', () => {
  const cols = ['enrollmentNo','studentName','course','status','correctionRemarks'];
  const csv = [cols.join(','), ...latestReport.map(r => cols.map(k => '"' + String(r[k] ?? '').replace(/"/g,'""') + '"').join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8;'}));
  const a = document.createElement('a'); a.href = url; a.download = 'fitcs-verification-report.csv'; a.click(); URL.revokeObjectURL(url);
});
