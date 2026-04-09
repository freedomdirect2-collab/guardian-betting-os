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
  const isOpen=selected===game.game​​​​​​​​​​​​​​​​
