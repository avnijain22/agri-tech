
import { useEffect, useState } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

import api, { errMsg } from '../api/client';
import { useApp } from '../AuthContext';
import { useList, Alert, Empty } from '../components/ui';

export default function Weather() {
  const { t } = useApp();

  const farms = useList('/farms').data;

  const [farmId, setFarmId] = useState('');
  const [w, setW] = useState(null);
  const [err, setErr] = useState('');

  // Select the first available farm
  useEffect(() => {
    if (farms?.length && !farmId) {
      setFarmId(farms[0]._id);
    }
  }, [farms, farmId]);

  // Fetch weather whenever selected farm changes
  useEffect(() => {
    if (!farmId) return;

    let cancelled = false;

    setW(null);
    setErr('');

    console.log('Selected Farm ID:', farmId);

    api.get(`/weather/farm/${farmId}`)
      .then(response => {
        if (!cancelled) {
          setW(response.data);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setErr(errMsg(error));
          console.error('Weather API error:', error.response?.data || error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [farmId]);

  if (farms && !farms.length) {
    return <Empty>{t('noFarms')}</Empty>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">

        <h2 className="m-0">{t('weather')}</h2>

        <select
          className="form-select w-auto"
          value={farmId}
          onChange={e => setFarmId(e.target.value)}
          aria-label="Farm"
        >
          {farms?.map(f => (
            <option key={f._id} value={f._id}>
              {f.farmName}
            </option>
          ))}
        </select>

      </div>

      <Alert error={err} />

      {!w && !err && (
        <div>{t('loading')}</div>
      )}

      {w?.weatherUnavailable && (
        <Alert
          error={
            w.message ||
            'Weather is temporarily unavailable. Please try again later.'
          }
        />
      )}

      {w && !w.weatherUnavailable && w.current && (
        <>
          {/* Current weather statistics */}

          <div className="row g-3 mb-3">

            {[
              ['Temperature', `${w.current.temperature}°C`],
              ['Humidity', `${w.current.humidity}%`],
              ['Rain now', `${w.current.rain} mm`],
              ['Wind', `${w.current.wind} km/h`]
            ].map(([key, value]) => (
              <div key={key} className="col-6 col-lg-3">
                <div className="panel stat">
                  <div className="n">{value}</div>
                  <div className="text-muted">{key}</div>
                </div>
              </div>
            ))}

          </div>

          {/* Pest risks */}

          <div className="panel mb-3">

            <h5>{t('pestRisk')}</h5>

            {w.pestRisks.length === 0 ? (
              <p className="text-muted mb-0">
                {t('noRisk')}
              </p>
            ) : (
              w.pestRisks.map(r => (
                <div
                  key={r.pest}
                  className={`panel risk-${r.severity} mb-2`}
                >
                  <strong>{r.pest}</strong>

                  <div className="small">
                    {r.why}
                  </div>

                  <div className="small text-muted">
                    {r.action}
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Alerts */}

          {w.alerts.length > 0 && (
            <div className="panel mb-3">

              <h5>{t('alerts')}</h5>

              {w.alerts.map(a => (
                <div
                  key={a._id}
                  className={`panel risk-${a.severity} mb-2`}
                >
                  <strong>{a.title}</strong>

                  {a.crop && (
                    <span className="badge text-bg-light ms-2">
                      {a.crop}
                    </span>
                  )}

                  <div className="small">
                    {a.message}
                  </div>
                </div>
              ))}

            </div>
          )}

          {/* Seven-day forecast chart */}

          <div className="panel mb-3" style={{ height: 300 }}>

            <h5>{t('forecast')}</h5>

            <ResponsiveContainer width="100%" height="85%">

              <LineChart data={w.daily}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={date => date.slice(5)}
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  dataKey="tmax"
                  name="Max °C"
                  stroke="#b3261e"
                />

                <Line
                  dataKey="tmin"
                  name="Min °C"
                  stroke="#3b7ea1"
                />

                <Line
                  dataKey="rain"
                  name="Rain mm"
                  stroke="#3f7d3a"
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* Daily forecast cards */}

          <div className="d-flex gap-2 overflow-auto pb-2">

            {w.daily.map(d => (
              <div key={d.date} className="panel day">

                <div className="small text-muted">
                  {new Date(d.date).toLocaleDateString(
                    undefined,
                    {
                      weekday: 'short',
                      day: 'numeric'
                    }
                  )}
                </div>

                <div>
                  <strong>{Math.round(d.tmax)}°</strong>
                  {' / '}
                  {Math.round(d.tmin)}°
                </div>

                <div className="small">
                  {d.rainChance ?? 0}% rain
                </div>

              </div>
            ))}

          </div>

        </>
      )}

    </>
  );
}
