import React,{useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import {initializeApp} from "firebase/app";
import {getFirestore,collection,doc,onSnapshot,setDoc,addDoc,updateDoc,deleteDoc,query,orderBy} from "firebase/firestore";
import {getAuth,signInAnonymously} from "firebase/auth";
import {Gavel,Users,Shield,Play,Pause,Plus,Trash2,Edit3,ChevronRight,RefreshCw,Trophy} from "lucide-react";
import "./styles.css";

const cfg={
 apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
 projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
 messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID
};
const app=initializeApp(cfg), db=getFirestore(app), auth=getAuth(app);
const teamsRef=collection(db,"teams"), playersRef=collection(db,"players"), auctionRef=doc(db,"settings","auction");

const money=n=>`৳${Number(n||0).toLocaleString("en-BD")}`;
function App(){
 const [tab,setTab]=useState("auction"),[teams,setTeams]=useState([]),[players,setPlayers]=useState([]),
 [auction,setAuction]=useState({status:"idle",playerId:null,currentBid:0,bidTeamId:null}),[ready,setReady]=useState(false);
 useEffect(()=>{signInAnonymously(auth).then(()=>setReady(true)).catch(console.error)},[]);
 useEffect(()=>onSnapshot(teamsRef,s=>setTeams(s.docs.map(d=>({id:d.id,...d.data()})))),[]);
 useEffect(()=>onSnapshot(playersRef,s=>setPlayers(s.docs.map(d=>({id:d.id,...d.data()})))),[]);
 useEffect(()=>onSnapshot(auctionRef,s=>s.exists()&&setAuction(s.data())),[]);
 const active=players.find(p=>p.id===auction.playerId);
 const sold=players.filter(p=>p.status==="sold");
 async function seed(){for(let i=1;i<=4;i++)await setDoc(doc(teamsRef,"team"+i),{name:`Team ${i}`,budget:2000,spent:0});await setDoc(auctionRef,{status:"idle",playerId:null,currentBid:0,bidTeamId:null});alert("4 teams created with ৳2000 each.");}
 if(!ready)return <div className="center">Connecting to auction room…</div>;
 return <div className="app"><header><div><b>JPL</b><span>JANKHALI PREMIER LEAGUE</span></div><div className="live"><i/> LIVE AUCTION</div></header>
 <nav>{[["auction","Auction",Gavel],["players","Players",Users],["teams","Teams",Shield],["admin","Admin",Trophy]].map(([k,l,I])=><button className={tab===k?"active":""} onClick={()=>setTab(k)}><I size={18}/>{l}</button>)}</nav>
 <main>{tab==="auction"&&<Auction active={active} auction={auction} teams={teams} players={players}/>}
 {tab==="players"&&<Players players={players}/>}
 {tab==="teams"&&<Teams teams={teams} players={players}/>}
 {tab==="admin"&&<Admin teams={teams} players={players} auction={auction} seed={seed}/>}</main>
 <footer>JPL Auction • 4 Teams • ৳2,000 Purse Each</footer></div>
}
function Auction({active,auction,teams,players}){
 const bid=async(t)=>{if(!active||auction.status!=="live")return;const team=teams.find(x=>x.id===t.id);const next=auction.currentBid+50;if(team && team.budget-team.spent>=next)await updateDoc(auctionRef,{currentBid:next,bidTeamId:t.id})};
 const next=async()=>{const p=players.find(x=>x.status==="pending");if(p)await updateDoc(auctionRef,{status:"live",playerId:p.id,currentBid:p.basePrice||0,bidTeamId:null})};
 const finish=async(s)=>{if(!active)return;if(s==="sold"&&auction.bidTeamId){const t=teams.find(x=>x.id===auction.bidTeamId);await updateDoc(doc(teamsRef,t.id),{spent:(t.spent||0)+auction.currentBid});await updateDoc(doc(playersRef,active.id),{status:"sold",soldPrice:auction.currentBid,soldTeamId:t.id})}else await updateDoc(doc(playersRef,active.id),{status:"unsold"});await updateDoc(auctionRef,{status:"idle",playerId:null,currentBid:0,bidTeamId:null})};
 return <section><div className="hero"><div className="playercard">{active?<><div className="avatar">{active.name?.[0]||"P"}</div><h1>{active.name}</h1><p>{active.role||"Player"} • {active.category||"Open"}</p><small>Base Price</small><strong>{money(active.basePrice)}</strong></>:<><Gavel size={70}/><h1>Ready for Auction</h1><p>Admin can start the next player.</p></>}</div>
 <div className="bidbox"><span>CURRENT BID</span><strong>{money(auction.currentBid)}</strong><div className="bidby">{auction.bidTeamId?teams.find(t=>t.id===auction.bidTeamId)?.name:"No bid yet"}</div><div className="buttons">{teams.map(t=><button disabled={!active||auction.status!=="live"||t.budget-t.spent<auction.currentBid+50} onClick={()=>bid(t)}>Bid +৳50<br/><b>{t.name}</b></button>)}</div></div></div>
 <div className="bar"><button onClick={next}><ChevronRight/>Next Player</button><button onClick={()=>finish("sold")} disabled={!active}><Trophy/> SOLD</button><button onClick={()=>finish("unsold")} disabled={!active}><Pause/> UNSOLD</button></div>
 <div className="purse">{teams.map(t=><div><b>{t.name}</b><span>{money((t.budget||2000)-(t.spent||0))}</span><small>remaining</small></div>)}</div></section>
}
function Players({players}){
 const [form,setForm]=useState({name:"",role:"Batsman",category:"A",basePrice:100}),[editing,setEditing]=useState(null);
 async function save(e){e.preventDefault();const data={...form,basePrice:Number(form.basePrice),status:editing?.status||"pending"};if(editing)await updateDoc(doc(playersRef,editing.id),data);else await addDoc(playersRef,data);setEditing(null);setForm({name:"",role:"Batsman",category:"A",basePrice:100})}
 return <section><div className="panel"><h2>{editing?"Edit Player":"Add Player"}</h2><form onSubmit={save}><input placeholder="Player name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>{["Batsman","Bowler","All-rounder","Wicketkeeper"].map(x=><option>{x}</option>)}</select><input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/><input type="number" placeholder="Base price" value={form.basePrice} onChange={e=>setForm({...form,basePrice:e.target.value})}/><button><Plus/> {editing?"Update":"Add Player"}</button></form></div><div className="list">{players.map(p=><div className="row"><div><b>{p.name}</b><small>{p.role} • {p.category} • Base {money(p.basePrice)}</small></div><em className={p.status}>{p.status}</em><button onClick={()=>{setEditing(p);setForm(p)}}><Edit3/></button><button onClick={()=>deleteDoc(doc(playersRef,p.id))}><Trash2/></button></div>)}</div></section>
}
function Teams({teams,players}){return <section><h2>Teams & Squads</h2><div className="teamgrid">{teams.map(t=><div className="team"><h3>{t.name}</h3><strong>{money((t.budget||2000)-(t.spent||0))}</strong><small>Remaining purse</small><hr/>{players.filter(p=>p.soldTeamId===t.id).map(p=><div className="squad">{p.name}<span>{money(p.soldPrice)}</span></div>)}<p>{players.filter(p=>p.soldTeamId===t.id).length} players</p></div>)}</div></section>}
function Admin({teams,players,auction,seed}){const [names,setNames]=useState(teams.map(t=>t.name));async function save(){for(let i=0;i<teams.length;i++)await updateDoc(doc(teamsRef,teams[i].id),{name:names[i]});alert("Saved")}return <section><div className="panel"><h2>Admin Control</h2><p>Set the four team names. Every team starts with <b>৳2,000</b>.</p>{teams.length<4?<button onClick={seed}><RefreshCw/> Create 4 Teams</button>:<>{teams.map((t,i)=><input value={names[i]||t.name} onChange={e=>{let n=[...names];n[i]=e.target.value;setNames(n)}}/>)}<button onClick={save}>Save Team Names</button></>}</div><div className="panel"><h3>Auction status</h3><p>Status: <b>{auction.status}</b> • Sold players: <b>{players.filter(p=>p.status==="sold").length}</b></p></div></section>}
createRoot(document.getElementById("root")).render(<App/>);