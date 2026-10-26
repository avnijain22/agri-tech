import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { useApp } from '../AuthContext';
import { useList, Alert } from '../components/ui';

const COLORS = ['#3f7d3a', '#d9a520', '#3b7ea1', '#b3261e'];

export default function Dashboard() {
  const { t, user } = useApp();
  const { data, error } = useList('/dashboard');
  if (!data) return <div>{error ? <Alert error={error} /> : t('loading')}</div>;
  const stats = [['totalFarms', data.totals.farms], ['totalCrops', data.totals.crops], ['totalAcres', data.totals.acres], ['totalOrders', data.totals.orders]];

  return (
    <>
      <h2 className="mb-3">{t('dashboard')} <small className="text-muted fs-6">– {user.name}</small></h2>
      <div className="row g-3 mb-3">
        {stats.map(([k, n]) => (
          <div key={k} className="col-6 col-lg-3"><div className="panel stat"><div className="n">{n}</div><div className="text-muted">{t(k)}</div></div></div>
        ))}
      </div>
      <div className="row g-3">
        <div className="col-lg-5">
          <div className="panel" style={{ height: 320 }}>
            <h5>Crop status</h5>
            {data.cropStatus.length ? (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart><Pie data={data.cropStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {data.cropStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted">{t('noCrops')}</p>}
          </div>
        </div>
        <div className="col-lg-7">
          <div className="panel" style={{ height: 320 }}>
            <h5>Yield by crop (quintal)</h5>
            {data.yieldByCrop.length ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data.yieldByCrop}><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
                  <Bar dataKey="expected" fill="#d9a520" /><Bar dataKey="actual" fill="#3f7d3a" /></BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted">Add expected or actual yield to a crop to see this chart.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
