import { useState, useEffect, useCallback } from 'react'

function getSignalLabel(signal) {
  switch(signal) {
    case 'BET':   return {color:'#00e676',icon:'🎯',grade:'A'}
    case 'LEAN':  return {color:'#7cfc00',icon:'📈',grade:'B'}
    case 'WATCH': return {color:'#ffaa00',icon:'👁',grade:'C'}
    default:      return {color:'#ff4444',icon:'⛔',grade:'F'}
  }
}
function kelly(contain,P,bankroll){
  return (Math.min(0.05,Math.max(0,contain-P)*0.25)*bankroll).toFixed(2)
}
const SPORTS={NBA:'🏀 NBA',MLB:'⚾ MLB',NHL:'🏒 NHL',NFL:'🏈 NFL',UFC:'🥊 MMA',EPL:'⚽ EPL'}

function Arc({pct,color,label}){
  const r=34,cx=42,cy=46,circ=Math.PI*r
  return(
    <div style={{textAlign:'center',flex:1}}>
      <svg viewBox="0 0 84 52" style={{width:'100%'}}>
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="#07091a" strokeWidth="7"/>
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${Math.min(pct,1)*circ} ${circ}`} strokeLinecap="round"
          style={{transition:'stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)',filter:`drop-shadow(0 0 5px ${color}88)`}}/>
        <text x={cx} y={cy-1} textAnchor="middle" fill="#dde8ff"
          style={{fontSize:10,fontFamily:"'Rajdhani',sans-serif",fontWeight:700}}>
          {(Math.min(pct,1)*100).toFixed(0)}%
        </text>
      </svg>
      <div style={{fontSize:8,color:'#1e2e52',letterSpacing:1.5,marginTop:-4,fontFamily:"'DM Mono',monospace"}}>{label}</div>
    </div>
  )
}

function GameCard({game,bankroll,selected,onSelect}){
  const sl=getSignalLabel(game.signal)
  const k=kelly(game.containment,game.P,bankroll)
  const isActive=game.signal==='BET'||game.signal==='LEAN'
  const isOpen=selected===game.game
  const parts=(game.game||'').split(' vs ')
  const aS=(parts[0]||'').split(' ').pop()
  const hS=(parts[1]||'').split(' ').pop()
  const Bcap=5.0
  return(
    <div onClick={()=>onSelect(isOpen?null:game.game)}
      style={{borderRadius:14,border:`1.5px solid ${isOpen?sl.color+'44':'#0c1430'}`,
        background:isOpen?`linear-gradient(135deg,${sl.color}0b 0%,#040710 100%)`:'#040710',
        padding:'13px 13px 11px',cursor:'pointer',transition:'all 0.25s',
        position:'relative',overflow:'hidden',marginBottom:9}}>
      {isActive&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,
        background:`linear-gradient(90deg,transparent,${sl.color},transparent)`,
        animation:'shimmer 2.5s infinite'}}/>}
      <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:'#dde8ff',fontFamily:"'Rajdhani',sans-serif",
            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{game.game}</div>
          <div style={{fontSize:9,color:'#1e2e52',marginTop:3,fontFamily:"'DM Mono',monospace"}}>
            {game.time}{game.spread?`  ·  ${(game.spreadTeam||'').split(' ').pop()} ${game.spread}`:''}
            {game.total?`  ·  O/U ${game.total}`:''}
          </div>
          {(game.homeML||game.awayML)&&(
            <div style={{display:'flex',gap:5,marginTop:5}}>
              {[{label:aS,odds:game.awayML},{label:hS,odds:game.homeML}].filter(o=>o.odds).map((o,i)=>(
                <div key={i} style={{background:'#07091a',border:'1px solid #111e40',borderRadius:4,
                  padding:'2px 7px',fontSize:10,fontFamily:"'DM Mono',monospace"}}>
                  <span style={{color:'#1e2e52'}}>{o.label} </span>
                  <span style={{color:o.odds>0?'#00e676':'#ff6b6b',fontWeight:700}}>
                    {o.odds>0?'+':''}{o.odds}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1,flexShrink:0}}>
          <div style={{fontSize:22,filter:isActive?`drop-shadow(0 0 8px ${sl.color})`:'none'}}>{sl.icon}</div>
          <div style={{fontSize:12,fontWeight:900,color:sl.color,fontFamily:"'Rajdhani',sans-serif",
            letterSpacing:2,textShadow:isActive?`0 0 12px ${sl.color}`:'none'}}>{game.signal}</div>
          <div style={{fontSize:8,color:'#1e2e52',fontFamily:"'DM Mono',monospace"}}>{sl.grade}</div>
        </div>
      </div>
      <div style={{display:'flex',background:'#020510',borderRadius:8,padding:'8px 2px 4px',marginTop:10}}>
        <Arc pct={game.P} color="#ff6b6b" label="PRESSURE"/>
        <Arc pct={Math.min(game.Eacc/Bcap,1)} color="#ffa94d" label="E_ACC"/>
        <Arc pct={Math.min(game.GEI/3,1)} color="#4a9eff" label="GEI"/>
        <Arc pct={game.containment} color="#00e676" label="CONTAIN"/>
      </div>
      {isActive&&(
        <div style={{background:`${sl.color}11`,border:`1px solid ${sl.color}2a`,borderRadius:8,
          padding:'8px 10px',marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:8,color:sl.color,letterSpacing:2,fontFamily:"'DM Mono',monospace"}}>SHARP PLAY</div>
            <div style={{fontSize:13,fontWeight:700,color:'#dde8ff',fontFamily:"'Rajdhani',sans-serif",marginTop:1}}>{game.sharpPlay}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:8,color:'#1e2e52',letterSpacing:2,fontFamily:"'DM Mono',monospace"}}>KELLY SIZE</div>
            <div style={{fontSize:15,fontWeight:900,color:sl.color,fontFamily:"'Rajdhani',sans-serif"}}>${k}</div>
          </div>
        </div>
      )}
      {isOpen&&(
        <div style={{marginTop:10,borderTop:'1px solid #0c1430',paddingTop:10}}>
          <div style={{fontSize:10,color:'#3a4e72',lineHeight:1.7,fontFamily:"'DM Mono',monospace",marginBottom:10}}>{game.insight}</div>
          {(game.factors||[]).map((f,i)=>(
            <div key={i} style={{marginBottom:7}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#1e2e52',
                marginBottom:3,fontFamily:"'DM Mono',monospace"}}>
                <span>{f.name}</span>
                <span style={{color:f.magnitude>0.65?'#ff6b6b':'#4a9eff'}}>{(f.magnitude*10).toFixed(1)}/10</span>
              </div>
              <div style={{background:'#07091a',borderRadius:2,height:3}}>
                <div style={{width:`${f.magnitude*100}%`,height:'100%',borderRadius:2,
                  background:f.magnitude>0.65?'#ff4444':f.magnitude>0.4?'#ffaa00':'#3d7fff',
                  transition:'width 0.6s ease'}}/>
              </div>
            </div>
          ))}
          <div style={{background:'#020510',borderRadius:6,padding:'8px 10px',marginTop:8}}>
            {[{l:'P(t)',v:(game.P||0).toFixed(4)},{l:'E_acc',v:(game.Eacc||0).toFixed(4)},
              {l:'GEI',v:(game.GEI||0).toFixed(4)},{l:'Containment',v:((game.containment||0)*100).toFixed(1)+'%'},
              {l:'Books',v:String(game.bookCount||0)}].map((r,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:8,padding:'3px 0',
                borderBottom:i<4?'1px solid #080e1e':'none',fontFamily:"'DM Mono',monospace"}}>
                <span style={{color:'#162040'}}>{r.l}</span>
                <span style={{color:'#4a9eff',fontWeight:700}}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App(){
  const [sport,setSport]=useState('NBA')
  const [games,setGames]=useState([])
  const [loading,setLoading]=useState(false)
  const [status,setStatus]=useState('SELECT A SPORT')
  const [error,setError]=useState(null)
  const [remaining,setRemaining]=useState(null)
  const [bankroll,setBankroll]=useState(1000)
  const [selected,setSelected]=useState(null)
  const [editBR,setEditBR]=useState(false)
  const [tempBR,setTempBR]=useState('1000')

  const load=useCallback(async(s)=>{
    setSport(s);setGames([]);setSelected(null);setError(null)
    setLoading(true);setStatus(`SCANNING LIVE ${s} ODDS...`)
    try{
      const res=await fetch(`/api/odds?sport=${s}`)
      const data=await res.json()
      if(!res.ok)throw new Error(data.error||`HTTP ${res.status}`)
      setGames(data.games||[])
      setRemaining(data.remaining)
      setStatus(`${data.games?.length||0} GAMES · ${new Date().toLocaleTimeString()}`)
    }catch(e){setError(e.message);setStatus('ERROR')}
    setLoading(false)
  },[])

  useEffect(()=>{load('NBA')},[load])

  const plays=games.filter(g=>g.signal==='BET'||g.signal==='LEAN')

  return(
    <div style={{minHeight:'100vh',background:'#030510',fontFamily:"'DM Mono','Courier New',monospace",color:'#dde8ff'}}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <div style={{background:'linear-gradient(180deg,#050a1c 0%,#030810 100%)',borderBottom:'1px solid #0b1330',
        padding:'14px 16px 10px',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:540,margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:8,letterSpacing:4,color:'#111e40',fontFamily:"'DM Mono',monospace"}}>GUARDIAN OS HOLDINGS · PAT. PENDING</div>
              <div style={{fontSize:21,fontWeight:700,color:'#dde8ff',fontFamily:"'Rajdhani',sans-serif",lineHeight:1.1}}>
                BETTING OS
                <span style={{fontSize:10,color:'#2563eb',fontWeight:400,marginLeft:7}}>LIVE</span>
                <span style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:'#00e676',
                  marginLeft:7,verticalAlign:'middle',boxShadow:'0 0 8px #00e676',animation:'blink 1.4s infinite'}}/>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:8,color:'#111e40',letterSpacing:2,fontFamily:"'DM Mono',monospace"}}>BANKROLL</div>
              {editBR?(
                <div style={{display:'flex',gap:4,alignItems:'center',marginTop:2}}>
                  <span style={{fontSize:11,color:'#1e2e52'}}>$</span>
                  <input type="number" value={tempBR} onChange={e=>setTempBR(e.target.value)}
                    style={{width:72,background:'#07091a',border:'1px solid #3d7fff',color:'#dde8ff',
                      borderRadius:4,padding:'2px 6px',fontSize:12,fontFamily:'inherit',outline:'none'}}/>
                  <button onClick={()=>{setBankroll(parseFloat(tempBR)||1000);setEditBR(false)}}
                    style={{background:'#1a4aff',border:'none',color:'#fff',borderRadius:4,
                      padding:'3px 8px',fontSize:10,cursor:'pointer'}}>✓</button>
                </div>
              ):(
                <div onClick={()=>{setTempBR(String(bankroll));setEditBR(true)}}
                  style={{fontSize:17,fontWeight:700,color:'#00e676',cursor:'pointer',
                    fontFamily:"'Rajdhani',sans-serif",marginTop:1}}>
                  ${bankroll.toLocaleString()}<span style={{fontSize:9,color:'#111e40',marginLeft:4}}>✏</span>
                </div>
              )}
            </div>
          </div>
          <div style={{display:'flex',gap:5,marginTop:10,overflowX:'auto',paddingBottom:2}}>
            {Object.entries(SPORTS).map(([key,val])=>(
              <button key={key} onClick={()=>load(key)} style={{flexShrink:0,padding:'5px 10px',borderRadius:6,
                border:sport===key?'1.5px solid #2563eb':'1.5px solid #0b1330',
                background:sport===key?'#091c50':'#050810',
                color:sport===key?'#90b4ff':'#162040',
                fontSize:11,cursor:'pointer',fontFamily:'inherit',transition:'all 0.2s'}}>{val}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{maxWidth:540,margin:'0 auto',padding:'10px 13px 50px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:11}}>
          <div style={{fontSize:8,letterSpacing:1.5,color:loading?'#ffaa00':error?'#ff4444':'#111e40',
            fontFamily:"'DM Mono',monospace",display:'flex',alignItems:'center',gap:5}}>
            {loading&&<span style={{animation:'spin 0.8s linear infinite',display:'inline-block'}}>⟳</span>}
            {error?`⚠ ${error}`:loading?status:`✅ ${status}`}
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            {remaining&&<span style={{fontSize:8,color:'#0f1e3a',fontFamily:"'DM Mono',monospace"}}>{remaining} calls left</span>}
            {!loading&&<button onClick={()=>load(sport)} style={{background:'transparent',border:'1px solid #0b1330',
              color:'#2563eb',borderRadius:5,padding:'3px 9px',fontSize:8,cursor:'pointer',
              fontFamily:'inherit',letterSpacing:1}}>↺ REFRESH</button>}
          </div>
        </div>
        {games.length>0&&(
          <div style={{background:'#030810',border:'1px solid #0b1330',borderRadius:10,padding:'8px 14px',
            display:'flex',gap:20,marginBottom:12,alignItems:'center'}}>
            <div>
              <div style={{fontSize:8,color:'#111e40',letterSpacing:2,fontFamily:"'DM Mono',monospace"}}>PLAYS</div>
              <div style={{fontSize:19,fontWeight:700,color:'#00e676',fontFamily:"'Rajdhani',sans-serif"}}>{plays.length}</div>
            </div>
            <div>
              <div style={{fontSize:8,color:'#111e40',letterSpacing:2,fontFamily:"'DM Mono',monospace"}}>SCANNED</div>
              <div style={{fontSize:19,fontWeight:700,color:'#dde8ff',fontFamily:"'Rajdhani',sans-serif"}}>{games.length}</div>
            </div>
            <div style={{marginLeft:'auto'}}>
              <div style={{fontSize:8,color:'#111e40',letterSpacing:2,fontFamily:"'DM Mono',monospace"}}>HSE ENGINE</div>
              <div style={{fontSize:10,color:'#3d7fff',fontFamily:"'DM Mono',monospace"}}>NOMINAL ●</div>
            </div>
          </div>
        )}
        {loading&&[1,2,3,4].map(i=>(
          <div key={i} style={{borderRadius:14,border:'1.5px solid #0c1430',background:'#040710',
            padding:13,marginBottom:9,animation:'skeleton 1.4s ease infinite'}}>
            <div style={{height:13,background:'#07091a',borderRadius:4,width:'62%',marginBottom:7}}/>
            <div style={{height:9,background:'#060814',borderRadius:4,width:'38%',marginBottom:13}}/>
            <div style={{height:52,background:'#020510',borderRadius:8}}/>
          </div>
        ))}
        {!loading&&games.map((g,i)=>(
          <GameCard key={i} game={g} bankroll={bankroll} selected={selected} onSelect={setSelected}/>
        ))}
        {!loading&&!error&&games.length===0&&(
          <div style={{textAlign:'center',padding:'64px 20px',color:'#0d1425'}}>
            <div style={{fontSize:38,marginBottom:10}}>🛰</div>
            <div style={{fontSize:11,letterSpacing:3,fontFamily:"'Rajdhani',sans-serif"}}>HSE ENGINE STANDING BY</div>
          </div>
        )}
        <div style={{marginTop:28,fontSize:8,color:'#080c18',textAlign:'center',letterSpacing:1.5,
          lineHeight:2.2,fontFamily:"'DM Mono',monospace"}}>
          GUARDIAN BETTING OS™ · HUMAN STABILITY ENGINE™<br/>
          Patent Pending · App. 19/633,827 · Guardian OS Holdings LLC<br/>
          S(t)=(P(t),dP/dt) · E_acc(t)=∫P(τ)dτ · GEI(t)=Σk·v·w<br/>
          FOR ENTERTAINMENT PURPOSES ONLY · GAMBLE RESPONSIBLY
        </div>
      </div>
      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{opacity:0.3}50%{opacity:1}100%{opacity:0.3}}
        @keyframes skeleton{0%,100%{opacity:0.4}50%{opacity:0.85}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:#030510}
        ::-webkit-scrollbar-thumb{background:#162040;border-radius:2px}
        button:hover{opacity:0.8}
      `}</style>
    </div>
  )
}
