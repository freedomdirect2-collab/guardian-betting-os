import { useState } from 'react'

export default function App() {
  const [sport, setSport] = useState('NBA')
  return (
    <div style={{background:'#030510',minHeight:'100vh',color:'#dde8ff',fontFamily:'monospace',padding:20}}>
      <h1 style={{color:'#00e676'}}>GUARDIAN BETTING OS</h1>
      <p style={{color:'#2563eb',fontSize:12}}>LIVE · Pat. Pending 19/633,827</p>
      <p style={{color:'#3d7fff',marginTop:10}}>HSE ENGINE NOMINAL ●</p>
    </div>
  )
}
