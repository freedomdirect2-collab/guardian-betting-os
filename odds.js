const ODDS_BASE='https://api.the-odds-api.com/v4'
const SPORT_KEYS={NBA:'basketball_nba',MLB:'baseball_mlb',NHL:'icehockey_nhl',NFL:'americanfootball_nfl',UFC:'mma_mixed_martial_arts',EPL:'soccer_epl'}
function oV(p){if(!p||p.length<2)return 0.3;return Math.min(1,(Math.max(...p)-Math.min(...p))/50)}
function sM(s){if(s==null)return 0.4;return Math.min(1,Math.abs(s)/20)}
function vP(h,a){if(!h||!a)return 0.4;const t=o=>o>0?100/(o+100):Math.abs(o)/(Math.abs(o)+100);return Math.min(1,(t(h)+t(a)-1)*6)}
function pr(f){return Math.min(1,f.reduce((s,x)=>s+x.magnitude*x.weight,0))}
function hse(game){
const books=game.bookmakers||[]
const h2h=books.flatMap(b=>b.markets).find(m=>m.key==='h2h')
const sp=books.flatMap(b=>b.markets).find(m=>m.key==='spreads')
const tot=books.flatMap(b=>b.markets).find(m=>m.key==='totals')
const hO=h2h?.outcomes?.find(o=>o.name===game.home_team)?.price
const aO=h2h?.outcomes?.find(o=>o.name===game.away_team)?.price
const spread=sp?.outcomes?.[0]?.point
const total=tot?.outcomes?.find(o=>o.name==='Over')?.point
const allH=books.map(b=>b.markets?.find(m=>m.key==='h2h')?.outcomes?.find(o=>o.name===game.home_team)?.price).filter(Boolean)
const bc=books.length
const factors=[
{name:'Line Movement',magnitude:oV(allH),weight:0.25},
{name:'Market Pressure',magnitude:vP(hO,aO),weight:0.25},
{name:'Spread Size',magnitude:sM(spread),weight:0.20},
{name:'Total Instability',magnitude:total?Math.min(1,Math.abs(total-220)/100):0.3,weight:0.15},
{name:'Liquidity Gap',magnitude:Math.max(0,1-bc/12),weight:0.15}
]
const genome=[
{label:'Market Edge',k:1.2,v:0.8,w:bc>6?0.9:0.7},
{label:'Line Value',k:1.1,v:spread!=null?0.85:0.6,w:0.8},
{label:'Price Stability',k:0.95,v:allH.length>3?0.8:0.6,w:0.75}
]
const P=pr(factors)
const Eacc=P*0.88+P*0.94+P
const GEI=genome.reduce((s,g)=>s+g.k*g.v*g.w,0)
const Bcap=5.0
const contain=Math.max(0,Math.min(1,(GEI/(P+0.001))*(1-Eacc/(Bcap+0.001))))
let signal=Eacc>Bcap*0.85?'HOLD':contain>0.68&&P<0.48?'BET':contain>0.52&&P<0.62?'LEAN':contain>0.38?'WATCH':'HOLD'
let sharpPlay='HOLD'
if(signal==='BET'||signal==='LEAN'){
if(spread!=null){const tm=spread<0?game.home_team:game.away_team;sharpPlay=`${tm.split(' ').pop()} ${spread<0?spread:'+'+Math.abs(spread)}`}
else if(hO)sharpPlay=`${game.home_team.split(' ').pop()} ML ${hO>0?'+':''}${hO}`
}
return{game:`${game.away_team} vs ${game.home_team}`,time:new Date(game.commence_time).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZoneName:'short'}),spread:spread!=null?String(spread):null,spreadTeam:spread!=null?(spread<0?game.home_team:game.away_team):null,total:total!=null?String(total):null,homeML:hO||null,awayML:aO||null,bookCount:bc,factors,genome,P,Eacc,GEI,containment:contain,signal,sharpPlay,insight:`${bc} books. Containment ${(contain*100).toFixed(0)}% Pressure ${(P*100).toFixed(0)}%`}
}
export default async function handler(req,res){
res​​​​​​​​​​​​​​​​
