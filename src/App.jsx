import React, { useState, useCallback, useMemo } from 'react'
import { generateMockBusinesses } from './lib/mockData'
import { INDUSTRY_CONFIG, enrichWithRevenueModel, fmtMoney } from './lib/revenueModel'
import { trackEvent } from './lib/supabase'

const IND = INDUSTRY_CONFIG

const mkT = (mode) => mode === 'dark' ? {
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
  const [mode] = useState('dark')
  return mkT(mode)
}

function EmailGate({onUnlock, industry, zip}) {
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
        body: JSON.stringify({ email, role, zip, industry })
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

  return <div style={{position:'fixed',inset:0,zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(0,0,0,0.9)'}}>
    <div style={{background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:20,padding:'40px 32px',maxWidth:480,width:'100%'}}>
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontWeight:900,color:t.text,marginBottom:16}}>See investor insights</h2>
      <p style={{fontFamily:"Georgia,serif",fontSize:14,color:t.textSec,lineHeight:1.7,marginBottom:24}}>Join investors discovering Main Street opportunities.</p>
      <div style={{marginBottom:16}}>
        <input value={email} onChange={e=>{setEmail(e.target.value);setErr('')}} placeholder="investor@example.com"
          style={{width:'100%',padding:'14px',background:t.bgInput,border:`1px solid ${t.border}`,borderRadius:10,color:t.text,fontSize:12,boxSizing:'border-box'}}/>
      </div>
      <div style={{marginBottom:20}}>
        <select value={role} onChange={e=>setRole(e.target.value)}
          style={{width:'100%',padding:'12px',background:t.bgInput,border:`1px solid ${t.border}`,borderRadius:10,color:t.text,fontSize:12,boxSizing:'border-box'}}>
          <option value="investor">Investor</option>
          <option value="owner">Business Owner</option>
          <option value="broker">Broker</option>
          <option value="curious">Just Curious</option>
        </select>
      </div>
      {err&&<div style={{fontSize:9,color:t.red,marginBottom:16}}>{err}</div>}
      <button onClick={submit} disabled={loading} style={{width:'100%',padding:'16px',background:'linear-gradient(135deg,#0066cc,#00aadd)',border:'none',borderRadius:10,cursor:'pointer',fontSize:12,fontWeight:700,color:'#fff'}}>
        {loading?'UNLOCKING...':'UNLOCK RESULTS'}
      </button>
    </div>
  </div>
}

function Drawer({biz,ind,faved,onFave,onClose}) {
  const t = useT()
  const cfg = IND[ind]
  const [thesis, setThesis] = useState('Analyzing this business...')
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    setThesis('Revenue signals suggest this is cash-generative. Verify with tax returns before investing.')
    setLoading(false)
  }, [biz])

  const surf = {padding:'16px 20px',background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:12,marginBottom:16}

  return <div style={{position:'fixed',top:0,right:0,bottom:0,width:'100%',maxWidth:500,background:t.bg,boxShadow:'-4px 0 20px rgba(0,0,0,0.5)',zIndex:200,display:'flex',flexDirection:'column'}}>
    <div style={{flex:1,overflowY:'auto',padding:'24px 20px'}}>
      <button onClick={onClose} style={{background:'none',border:'none',fontSize:24,cursor:'pointer',color:t.textMut,marginBottom:16}}>✕</button>

      <div style={{marginBottom:24}}>
        <div style={{fontSize:9,color:t.textMut,letterSpacing:2,marginBottom:8}}>{cfg?.emoji} {cfg?.label}</div>
        <h1 style={{fontFamily:"Playfair Display,serif",fontSize:32,fontWeight:900,color:t.text,margin:0}}>{biz.name}</h1>
        <div style={{fontSize:10,color:t.textMut,marginTop:8}}>{biz.address}</div>
      </div>

      <div style={{...surf}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <div style={{fontSize:8,color:t.textMut,marginBottom:6}}>EST. REVENUE</div>
            <div style={{fontSize:16,fontWeight:700,color:t.text}}>{fmtMoney(biz.rev)}</div>
          </div>
          <div>
            <div style={{fontSize:8,color:t.textMut,marginBottom:6}}>OWNER EARNINGS</div>
            <div style={{fontSize:16,fontWeight:700,color:t.text}}>{fmtMoney(biz.sde)}</div>
          </div>
        </div>
      </div>

      <div style={{...surf}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
          <div>
            <div style={{fontSize:8,color:t.textMut,marginBottom:4}}>Rating</div>
            <div style={{fontSize:13,fontWeight:700,color:t.text}}>{biz.rating}/5</div>
          </div>
          <div>
            <div style={{fontSize:8,color:t.textMut,marginBottom:4}}>Reviews</div>
            <div style={{fontSize:13,fontWeight:700,color:t.text}}>{biz.reviewCount}</div>
          </div>
          <div>
            <div style={{fontSize:8,color:t.textMut,marginBottom:4}}>Years</div>
            <div style={{fontSize:13,fontWeight:700,color:t.text}}>{biz.yrs}</div>
          </div>
        </div>
      </div>

      <div style={{...surf}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
          <div style={{fontSize:8,color:t.textMut}}>AI ANALYSIS</div>
          <div style={{flex:1,height:1,background:t.border}}/>
        </div>
        {loading?<div style={{fontSize:10,color:t.textMut}}>Generating...</div>:<p style={{fontFamily:"Georgia,serif",fontSize:13,color:t.textSec,lineHeight:1.75,margin:0}}>{thesis}</p>}
      </div>

      <div style={{padding:'10px 14px',background:t.bgSurf,border:`1px solid ${t.border}`,borderRadius:8,marginBottom:20}}>
        <div style={{fontSize:8,color:t.textDim,lineHeight:1.7}}>Revenue estimates are proxies. Always request tax returns before investing.</div>
      </div>

      <button style={{width:'100%',padding:'15px',background:'linear-gradient(135deg,#0066cc,#0044aa)',border:'none',borderRadius:10,cursor:'pointer',fontSize:12,fontWeight:700,color:'#fff'}}>
        EXPRESS INTEREST
      </button>
    </div>
  </div>
}

export default function App() {
  const [mode,setMode]=useState('dark')
  const t=mkT(mode)

  const [tab,setTab]=useState('search')
  const [industry,setIndustry]=useState('')
  const [zip,setZip]=useState('')
  const [bizList,setBizList]=useState([])
  const [loading,setLoading]=useState(false)
  const [favs,setFavs]=useState(new Set())
  const [selBiz,setSelBiz]=useState(null)
  const [showGate,setShowGate]=useState(false)
  const [unlocked,setUnlocked]=useState(()=>!!localStorage.getItem('msi_unlocked'))

  const cfg=industry ? IND[industry] : null

  const doSearch=useCallback(async (ind,z)=>{
    setLoading(true)
    setTab('results')
    setBizList([])
    trackEvent('search', { industry: ind, zip: z })
    const biz = generateMockBusinesses(ind, z, 18).map(b => enrichWithRevenueModel(b, ind))
    setBizList(biz)
    setLoading(false)
  },[])

  const handleUnlock=()=>{
    setUnlocked(true)
  }

  const toggleFav=(id)=>{
    setFavs(new Set(favs.has(id)?[...favs].filter(f=>f!==id):[...favs,id]))
  }

  return <div style={{background:t.bg,color:t.text,minHeight:'100vh'}}>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      * { box-sizing: border-box; }
      body { margin: 0; }
    `}</style>

    <div style={{background:t.bgCard,borderBottom:`1px solid ${t.border}`,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:900}}>MainStreet Intel</div>
      <button onClick={()=>setMode(mode==='dark'?'light':'dark')} style={{background:'none',border:'none',cursor:'pointer',fontSize:14}}>
        {mode==='dark'?'☀️':'🌙'}
      </button>
    </div>

    {tab==='search'&&<div style={{maxWidth:900,margin:'0 auto',padding:'40px 20px'}}>
      <h1 style={{fontFamily:"Playfair Display,serif",fontSize:48,fontWeight:900,marginBottom:8}}>Find Main Street opportunities</h1>
      <p style={{fontFamily:"Georgia,serif",fontSize:16,color:t.textSec,lineHeight:1.7,maxWidth:600,marginBottom:32}}>Discover investor signals for every small business in your area.</p>
      
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
        <select value={industry} onChange={e=>setIndustry(e.target.value)} style={{padding:'14px',background:t.bgInput,border:`1px solid ${t.border}`,borderRadius:10,color:t.text,fontSize:12}}>
          <option value="">Choose business type...</option>
          {Object.entries(IND).map(([k,v])=><option key={k} value={k}>{v.emoji} {v.label}</option>)}
        </select>
        <input value={zip} onChange={e=>setZip(e.target.value)} placeholder="Zip code" style={{padding:'14px',background:t.bgInput,border:`1px solid ${t.border}`,borderRadius:10,color:t.text,fontSize:12}}/>
      </div>

      <button onClick={()=>{
        if(!industry || !zip) return
        if(!unlocked) { setShowGate(true); return }
        doSearch(industry,zip)
      }} style={{width:'100%',padding:'16px',background:'linear-gradient(135deg,#0066cc,#00aadd)',border:'none',borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:700,color:'#fff'}}>
        SEARCH
      </button>
    </div>}

    {tab==='results'&&<div style={{maxWidth:1200,margin:'0 auto',padding:'24px 20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontWeight:900,margin:0}}>{cfg?.label} in {zip}</h2>
        <button onClick={()=>{setTab('search');setBizList([])}} style={{background:'none',border:'none',color:t.textMut,cursor:'pointer',fontSize:10}}>← NEW SEARCH</button>
      </div>

      {loading?<div style={{textAlign:'center',padding:'40px',color:t.textMut}}>Loading...</div>:<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
        {bizList.map(b=><div key={b.id} onClick={()=>setSelBiz(b)} style={{background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:12,padding:16,cursor:'pointer'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:12}}>
            <div>
              <h3 style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:900,margin:'0 0 4px 0'}}>{b.name}</h3>
              <div style={{fontSize:9,color:t.textMut}}>⭐ {b.rating} ({b.reviewCount})</div>
            </div>
            <button onClick={e=>{e.stopPropagation();toggleFav(b.id)}} style={{background:'none',border:'none',cursor:'pointer',fontSize:18}}>
              {favs.has(b.id)?'❤️':'🤍'}
            </button>
          </div>
          <div style={{fontSize:8,color:t.textMut,marginBottom:12}}>{b.address}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
            <div>
              <div style={{fontSize:7,color:t.textMut,marginBottom:2}}>REVENUE</div>
              <div style={{fontSize:12,fontWeight:700}}>{fmtMoney(b.rev)}</div>
            </div>
            <div>
              <div style={{fontSize:7,color:t.textMut,marginBottom:2}}>SDE</div>
              <div style={{fontSize:12,fontWeight:700}}>{fmtMoney(b.sde)}</div>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:12,borderTop:`1px solid ${t.border}`,fontSize:9,color:t.textMut}}>
            <div>{b.yrs} yrs</div>
            <div style={{fontWeight:700,color:cfg?.color||'#0066cc',fontSize:14}}>{b.sig}</div>
          </div>
        </div>)}
      </div>}
    </div>}

    {selBiz&&<Drawer biz={selBiz} ind={industry} faved={favs.has(selBiz.id)} onFave={()=>toggleFav(selBiz.id)} onClose={()=>setSelBiz(null)}/>}

    {showGate&&<EmailGate onUnlock={handleUnlock} industry={industry} zip={zip}/>}
  </div>
}
