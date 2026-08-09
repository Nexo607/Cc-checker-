import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import "./style.css";

const API=import.meta.env.VITE_API_BASE||"http://localhost:8000";

const initialSteps=[
"SESSION_INIT","PROXY_CHECK","LOGIN_PAGE","LOGIN","ADDCARD_PAGE",
"CARD_INFORMATION","UID_EXTRACTION","IFRAME_PARAMS","PROCESS_PAYMENT"
];

function App(){
 const [online,setOnline]=useState(false);
 const [scenario,setScenario]=useState("approved");
 const [amount,setAmount]=useState("0.01");
 const [proxy,setProxy]=useState("");
 const [reference,setReference]=useState("");
 const [running,setRunning]=useState(false);
 const [result,setResult]=useState(null);
 const [logs,setLogs]=useState([]);
 const [active,setActive]=useState("");

 useEffect(()=>{fetch(API+"/api/health").then(r=>setOnline(r.ok)).catch(()=>setOnline(false))},[]);

 async function run(){
   setRunning(true);setResult(null);
   try{
     const r=await fetch(API+"/api/run",{method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({scenario,amount:Number(amount),proxy,reference})});
     const data=await r.json();
     for(const s of data.steps){setActive(s.step);await new Promise(x=>setTimeout(x,90))}
     setResult(data);setLogs(x=>[data,...x].slice(0,25));
   }catch(e){setResult({status:"ERROR",message:String(e)})}
   finally{setRunning(false)}
 }

 return <div className="shell">
  <header>
   <div><div className="logo">NEXO <b>// FULL TERMINAL</b></div><div className="tag">PAYMENT WORKFLOW SANDBOX</div></div>
   <div className={"online "+(online?"yes":"")}>● {online?"API ONLINE":"API OFFLINE"}</div>
  </header>

  <main>
   <div className="warning">SANDBOX ONLY — REAL PAN/CVV INPUT IS DISABLED</div>

   <div className="topgrid">
    <section className="panel control">
     <h2>CONTROL CENTER</h2>
     <label>Sandbox scenario</label>
     <select value={scenario} onChange={e=>setScenario(e.target.value)}>
       <option value="approved">Approved</option><option value="declined">Declined</option><option value="error">Processor Error</option>
     </select>
     <label>Amount</label><input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/>
     <label>Proxy label</label><input value={proxy} onChange={e=>setProxy(e.target.value)} placeholder="DIRECT / TEST PROXY"/>
     <label>Reference</label><input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Optional"/>
     <button disabled={!online||running} onClick={run}>{running?"EXECUTING WORKFLOW...":"START SANDBOX WORKFLOW"}</button>
    </section>

    <section className="panel">
     <h2>WORKFLOW PIPELINE</h2>
     <div className="pipeline">{initialSteps.map((s,i)=>{
       const done=result?.steps?.find(x=>x.step===s);
       return <div className={"step "+(done?"done ":"")+(active===s?"active":"")} key={s}>
        <span>{String(i+1).padStart(2,"0")}</span><b>{s}</b><em>{done?.status||"WAIT"}</em>
       </div>
     })}</div>
    </section>
   </div>

   <div className="grid">
    <section className="panel">
     <h2>TOOLS / MODULES</h2>
     {[
      ["GETCARD","Sandbox test-token parser"],
      ["SAVE_RESPONSE","Debug response storage"],
      ["LIVE","Response classification"],
      ["USERDATA","Synthetic test identity"],
      ["GET_PROXY_IP","Connection telemetry"],
      ["CHK.CODE","Async workflow controller"]
     ].map(x=><div className="module"><strong>{x[0]}</strong><span>{x[1]}</span></div>)}
    </section>

    <section className="panel">
     <h2>RESULT</h2>
     {result?<><div className={"result "+result.status.toLowerCase()}>{result.status}</div>
      <p>{result.message}</p>
      <div className="stats"><span>REQUESTS<strong>{result.requests}</strong></span><span>LATENCY<strong>{result.latency_ms}ms</strong></span><span>MODE<strong>SANDBOX</strong></span></div>
     </>:<div className="empty">Awaiting workflow execution...</div>}
    </section>
   </div>

   <section className="panel">
    <h2>DEBUG / JSON CONSOLE</h2>
    <pre>{result?JSON.stringify(result.debug_json,null,2):"> NEXO terminal ready\n> No execution yet"}</pre>
   </section>

   <section className="panel">
    <h2>HISTORY</h2>
    {logs.length?logs.map(x=><div className="history"><b className={x.status==="APPROVED"?"green":x.status==="DECLINED"?"yellow":"red"}>{x.status}</b><span>{x.reference||"NO REF"}</span><span>{x.amount}</span><small>{x.timestamp}</small></div>):<div className="empty">No runs recorded.</div>}
   </section>
  </main>
  <footer>NEXO // AUTHORIZED PAYMENT SANDBOX TERMINAL</footer>
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);
