import { Stethoscope } from 'lucide-react';

interface TimelineRow {
  id: string;
  date: string;
  time: string;
  doctor?: { name?: string; specialization?: string } | null;
  clinic?: { name?: string } | null;
  diagnosis: string;
  notes: string;
  status: string;
}

interface Props {
  patient: {
    name: string;
    age?: number;
    gender?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  timeline: TimelineRow[];
  credentials?: { username: string } | null; // only passed for admin/receptionist
  printedBy?: string;
}

const PatientPrintView = ({ patient, timeline, credentials, printedBy }: Props) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      {/* Inject print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #patient-print-area, #patient-print-area * { visibility: visible; }
          #patient-print-area {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: white;
            padding: 32px;
            font-family: sans-serif;
            font-size: 13px;
            color: #111;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="patient-print-area" style={{ display: 'none' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2563eb', paddingBottom: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>+</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#2563eb' }}>MediCare Clinic</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Patient Medical Report</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: '#6b7280' }}>
            <div>Printed: {today}</div>
            {printedBy && <div>By: {printedBy}</div>}
          </div>
        </div>

        {/* Patient Info */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: '#1e40af', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>
            Patient Information
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 24px' }}>
            <div><span style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Full Name</span><div style={{ fontWeight: 600 }}>{patient.name}</div></div>
            <div><span style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Age</span><div style={{ fontWeight: 600 }}>{patient.age ?? '—'} years</div></div>
            <div><span style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Gender</span><div style={{ fontWeight: 600 }}>{patient.gender ?? '—'}</div></div>
            <div><span style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Phone</span><div style={{ fontWeight: 600 }}>{patient.phone ?? '—'}</div></div>
            <div><span style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Email</span><div style={{ fontWeight: 600 }}>{patient.email ?? '—'}</div></div>
            <div><span style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Address</span><div style={{ fontWeight: 600 }}>{patient.address ?? '—'}</div></div>
          </div>
        </div>

        {/* Credentials — admin/receptionist only */}
        {credentials && (
          <div style={{ marginBottom: 20, background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, padding: '10px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#92400e' }}>Portal Access Credentials</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
              <div><span style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Username</span><div style={{ fontWeight: 600 }}>{credentials.username}</div></div>
              <div><span style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Password</span><div style={{ fontWeight: 600, color: '#9ca3af' }}>••••••••  (contact admin to reset)</div></div>
            </div>
          </div>
        )}

        {/* Visit History */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: '#1e40af', borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>
            Visit History ({timeline.length} record{timeline.length !== 1 ? 's' : ''})
          </div>
          {timeline.length === 0 ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No visits recorded.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  {['Date', 'Doctor', 'Department', 'Diagnosis', 'Notes', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #d1d5db' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeline.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{row.date}<br /><span style={{ fontSize: 10, color: '#9ca3af' }}>{row.time}</span></td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>{row.doctor?.name ?? '—'}<br /><span style={{ fontSize: 10, color: '#9ca3af' }}>{row.doctor?.specialization}</span></td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>{row.clinic?.name ?? '—'}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>{row.diagnosis}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', maxWidth: 160 }}>{row.notes}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: row.status === 'completed' ? '#dcfce7' : row.status === 'cancelled' ? '#fee2e2' : '#fef9c3',
                        color: row.status === 'completed' ? '#166534' : row.status === 'cancelled' ? '#991b1b' : '#92400e',
                      }}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, borderTop: '1px solid #e5e7eb', paddingTop: 10, fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>
          MediCare Clinic — Confidential Patient Record — {today}
        </div>
      </div>
    </>
  );
};

export default PatientPrintView;
