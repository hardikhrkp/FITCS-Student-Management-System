const msg = document.getElementById('message');
function setText(id, value) { document.getElementById(id).textContent = value || '—'; }
function safeLink(label, href) {
  const a = document.createElement('a'); a.textContent = label; a.href = href; return a;
}
async function loadDashboard() {
  if (!getToken()) { location.href = 'index.html'; return; }
  try {
    const d = await api('getStudentDashboard', { token: getToken() });
    setText('welcome', 'Welcome, ' + (d.studentName || 'Student'));
    setText('enrollmentNo', d.enrollmentNo); setText('course', d.course);
    setText('semester', d.semester); setText('minorSubject', d.minorSubject); setText('ueSubject', d.ueSubject);
    setText('verificationStatus', d.verification.status || 'PENDING');
    const box = document.getElementById('mentorDetails'); box.replaceChildren();
    if (!d.mentor) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'No active mentor assignment found. Contact your department office.'; box.append(p); }
    else {
      const name = document.createElement('strong'); name.textContent = d.mentor.name || 'Mentor'; box.append(name, document.createElement('br'));
      box.append('Contact: '); box.append(safeLink(d.mentor.contactNo || 'Not available', 'tel:' + (d.mentor.contactNo || ''))); box.append(document.createElement('br'));
      box.append('Email: '); box.append(safeLink(d.mentor.email || 'Not available', 'mailto:' + (d.mentor.email || '')));
    }
    if (d.verification.status === 'VERIFIED') {
      ['confirmCourse','confirmMinor','confirmUE'].forEach(id => { document.getElementById(id).checked = true; });
    }
    document.getElementById('correctionRemarks').value = d.verification.correctionRemarks || '';
  } catch (err) { msg.textContent = err.message; if (/session|log in|login/i.test(err.message)) { clearToken(); } }
}
document.getElementById('verificationForm').addEventListener('submit', async e => {
  e.preventDefault(); msg.textContent = ''; msg.className = 'message';
  const courseConfirmed = document.getElementById('confirmCourse').checked;
  const minorConfirmed = document.getElementById('confirmMinor').checked;
  const ueConfirmed = document.getElementById('confirmUE').checked;
  const correctionRemarks = document.getElementById('correctionRemarks').value.trim();
  if (!(courseConfirmed && minorConfirmed && ueConfirmed) && !correctionRemarks) {
    msg.textContent = 'Confirm all details or enter correction remarks.'; return;
  }
  try {
    const result = await api('submitVerification', { token: getToken(), courseConfirmed, minorConfirmed, ueConfirmed, correctionRemarks });
    msg.textContent = result.status === 'VERIFIED' ? 'Your verification has been recorded.' : 'Your correction request has been recorded.';
    msg.className = 'message success'; setText('verificationStatus', result.status);
  } catch (err) { msg.textContent = err.message; }
});
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try { await api('logout', { token: getToken() }); } catch (_) {}
  clearToken(); location.href = 'index.html';
});
loadDashboard();
