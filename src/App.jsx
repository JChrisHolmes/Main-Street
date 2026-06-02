import React, { useState, useCallback, useMemo } from 'react'
import { generateMockBusinesses } from './lib/mockData'
import { INDUSTRY_CONFIG, enrichWithRevenueModel, fmtMoney } from './lib/revenueModel'
import { trackEvent } from './lib/supabase'

const IND = INDUSTRY_CONFIG

const mkT = (m) => m === 'dark' ? {
  text: '#fff', textSec: '#aaa', textMut: '#666', textDim: '#444',
  bg: '#0a0a0a', bgCard: '#1a1a1a', bgInput: '#222',
  border: '#333', borderH: '#555', bgSurf: '#151515',
  accent: '#0066cc', red: '#ff4444', d: true
} : {
  text: '#000', textSec: '#555', textMut: '#888', textDim: '#bbb',
  bg: '#fff', bgCard: '#f5f5f5', bgInput: '#eee',
  border: '#ddd', borderH: '#ccc', bgSurf: '#fafafa',
  accent: '#0066cc', red: '#ff4444', d: false
}

const useT = () => {
  const [m] = useState('dark')
  return mkT(m)
}

function EmailGate({ onUnlock, industries, zip }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('investor')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const t = useT()

  const submit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr('Valid email required')
      return
    }
    setLoading(true)
    setErr('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, zip, industries: [...industries] })
      })
      const data = await res.json()
      if (!res.ok) {
        setErr(data.error || 'Failed')
        setLoading(false)
        return
      }
      localStorage.setItem('msi_unlocked', '1')
      onUnlock()
    } catch (e) {
      setErr('Network error')
      setLoading(false)
    }
  }

  return <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.9)' }}>
    <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '40px 32px', maxWidth: 480, width: '100%' }}>
      <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, color: t.text, marginBottom: 16 }}>See investor insights</h2>
      <p style={{ fontFamily: 'Georgia,serif', fontSize: 14, color: t.textSec, lineHeight: 1.7, marginBottom: 24 }}>Join hundreds of investors discovering Main Street opportunities.</p>
      <div style={{ marginBottom: 16 }}>
        <input value={email} onChange={e => { setEmail(e.target.value); setErr('') }} placeholder="investor@example.com" style={{ width: '100%', padding: '14px', background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 12, boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '12px', background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 12, boxSizing: 'border-box', cursor: 'pointer' }}>
          <option value="investor">Investor</option>
          <option value="owner">Business Owner</option>
          <option value="broker">Broker</option>
          <option value="curious">Just Curious</option>
        </select>
      </div>
      {err && <div style={{ fontSize: 9, color: t.red, marginBottom: 16 }}>{err}</div>}
      <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#0066cc,#00aadd)', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'UNLOCKING...' : 'UNLOCK RESULTS'}
      </button>
    </div>
  </div>
}

function InquiryModal({ business, industries, onClose }) {
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [step, setStep] = useState(1)
  const t = useT()

  const submit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr('Valid email required')
      return
    }
    setLoading(true)
    setErr('')
    try {
      const res = await fetch('/api/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: business.id, businessName: business.name, zip: business.address.split(', ').pop(), industries, investorEmail: email, investorNote: note || null })
      })
      const data = await res.json()
      if (!res.ok) {
        setErr(data.error || 'Failed')
        setLoading(false)
        return
      }
      setStep(2)
    } catch (e) {
      setErr('Network error')
      setLoading(false)
    }
  }

  if (step === 1) {
    return <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '32px 28px', maxWidth: 440, width: '100%' }}>
        <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 900, color: t.text, marginBottom: 10 }}>{business.name}</h2>
        <p style={{ fontFamily: 'Georgia,serif', fontSize: 13, color: t.textSec, lineHeight: 1.7, marginBottom: 20 }}>Register your interest. We will notify the owner if they claim their profile.</p>
        <div style={{ marginBottom: 16 }}>
          <input value={email} onChange={e => { setEmail(e.target.value); setErr('') }} placeholder="investor@example.com" style={{ width: '100%', padding: '12px', background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 12, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Optional message..." style={{ width: '100%', padding: '12px', background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 12, height: 80, resize: 'none', boxSizing: 'border-box' }} />
        </div>
        {err && <div style={{ fontSize: 9, color: t.red, marginBottom: 12 }}>{err}</div>}
        <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg,#0066cc,#00aadd)', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff', opacity: loading ? 0.7 : 1, marginBottom: 10 }}>
          {loading ? 'SENDING...' : 'SEND'}
        </button>
        <button onClick={onClose} style={{ width: '100%', padding: '12px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 10, cursor: 'pointer', fontSize: 11, color: t.textMut }}>
          Cancel
        </button>
      </div>
    </div>
  }

  return <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)' }}>
    <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '32px 28px', maxWidth: 440, width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
      <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, fontWeight: 900, color: '#0066cc', marginBottom: 12 }}>Interest Recorded</h2>
      <p style={{ fontFamily: 'Georgia,serif', fontSize: 13, color: t.textSec, lineHeight: 1.7, marginBottom: 20 }}>We have logged your interest.</p>
      <button onClick={onClose} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg,#0066cc,#0044aa)', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff' }}>
        DONE
      </button>
    </div>
  </div>
}

export default function App() {
  const [mode, setMode] = useState('dark')
  const t = mkT(mode)
  const [industries, setIndustries] = useState(new Set())
  const [zip, setZip] = useState('')
  const [bizList, setBizList] = useState([])
  const [loading, setLoading] = useState(false)
  const [favs, setFavs] = useState(new Set())
  const [selBiz, setSelBiz] = useState(null)
  const [showGate, setShowGate] = useState(false)
  const [unlocked, setUnlocked] = useState(() => !!localStorage.getItem('msi_unlocked'))
  const [showInquiry, setShowInquiry] = useState(false)
  const [tab, setTab] = useState('search')

  const doSearch = useCallback(async (inds, z) => {
    setLoading(true)
    setTab('results')
    setBizList([])
    trackEvent('search', { industries: [...inds], zip: z })
    const allBiz = []
    for (const ind of inds) {
      const biz = generateMockBusinesses(ind, z, 6).map(b => enrichWithRevenueModel(b, ind))
      allBiz.push(...biz)
    }
    setBizList(allBiz)
    setLoading(false)
  }, [])

  const toggleIndustry = (ind) => {
    const newInds = new Set(industries)
    if (newInds.has(ind)) {
      newInds.delete(ind)
    } else {
      newInds.add(ind)
    }
    setIndustries(newInds)
  }

  const toggleFav = (id) => {
    setFavs(new Set(favs.has(id) ? [...favs].filter(f => f !== id) : [...favs, id]))
  }

  return <div style={{ background: t.bg, color: t.text, minHeight: '100vh' }}>
    <style>{`@keyframes scaleIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}*{box-sizing:border-box}body{margin:0;background:${t.bg};color:${t.text}}`}</style>

    <div style={{ background: t.bgCard, borderBottom: `1px solid ${t.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, fontWeight: 900 }}>MainStreet Intel</div>
      <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
        {mode === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>

    {tab === 'search' && <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 48, fontWeight: 900, marginBottom: 8 }}>See investor signals for every small business in your neighborhood</h1>
      <p style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: t.textSec, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>Discover where capital is looking.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: t.textMut, letterSpacing: 1.5, display: 'block', marginBottom: 12 }}>BUSINESS TYPES (select one or more)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(IND).map(([k, v]) => (
              <button
                key={k}
                onClick={() => toggleIndustry(k)}
                style={{
                  padding: '12px',
                  background: industries.has(k) ? v.color : 'transparent',
                  border: `2px solid ${industries.has(k) ? v.color : t.border}`,
                  borderRadius: 8,
                  color: industries.has(k) ? '#fff' : t.text,
                  fontFamily: 'Space Mono,monospace',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.2s'
                }}
              >
                {v.emoji} {v.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: t.textMut, letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>ZIP CODE</label>
          <input value={zip} onChange={e => setZip(e.target.value)} placeholder="02143" style={{ width: '100%', padding: '14px', background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontFamily: 'Space Mono,monospace', fontSize: 12 }} />
        </div>
      </div>

      <button
        onClick={() => {
          if (industries.size === 0 || !zip) return
          if (!unlocked) { setShowGate(true); return }
          doSearch(industries, zip)
        }}
        disabled={industries.size === 0 || !zip}
        style={{ width: '100%', padding: '16px', background: industries.size > 0 && zip ? 'linear-gradient(135deg,#0066cc,#00aadd)' : '#444', border: 'none', borderRadius: 10, cursor: industries.size > 0 && zip ? 'pointer' : 'not-allowed', fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 1 }}
      >
        SEARCH →
      </button>
    </div>}

    {tab === 'results' && <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 28, fontWeight: 900, margin: 0 }}>
          {[...industries].map(i => IND[i]?.label).join(' + ')} in {zip}
        </h2>
        <button onClick={() => { setTab('search'); setBizList([]) }} style={{ background: 'none', border: 'none', color: t.textMut, cursor: 'pointer', fontSize: 10 }}>
          ← NEW SEARCH
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16, marginBottom: 32 }}>
        {loading ? <div style={{ textAlign: 'center', padding: '40px', color: t.textMut }}>Loading...</div> : bizList.map(b => (
          <div
            key={b.id}
            onClick={() => { setSelBiz(b); setShowInquiry(true) }}
            style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 16, fontWeight: 900, margin: '0 0 4px 0' }}>{b.name}</h3>
                <div style={{ fontSize: 9, color: t.textMut }}>⭐ {b.rating.toFixed(1)} ({b.reviewCount})</div>
              </div>
              <button onClick={e => { e.stopPropagation(); toggleFav(b.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                {favs.has(b.id) ? '❤️' : '🤍'}
              </button>
            </div>
            <div style={{ fontSize: 8, color: t.textMut, marginBottom: 12 }}>{b.address}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 7, color: t.textMut, marginBottom: 2 }}>REVENUE</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{fmtMoney(b.rev)}</div>
              </div>
              <div>
                <div style={{ fontSize: 7, color: t.textMut, marginBottom: 2 }}>SDE</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{fmtMoney(b.sde)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${t.border}`, fontSize: 9, color: t.textMut }}>
              <div>{b.yrs} yrs</div>
              <div style={{ fontWeight: 700, color: '#0066cc', fontSize: 14 }}>{b.sig}</div>
            </div>
          </div>
        ))}
      </div>
    </div>}

    {showInquiry && selBiz && <InquiryModal business={selBiz} industries={[...industries]} onClose={() => { setShowInquiry(false); setSelBiz(null) }} />}
    {showGate && <EmailGate onUnlock={() => setUnlocked(true)} industries={[...industries]} zip={zip} />}
  </div>
}
