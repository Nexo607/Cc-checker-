import asyncio, time, uuid
from datetime import datetime, timezone
from typing import Literal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app=FastAPI(title="NEXO Full Sandbox Terminal",version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class RunRequest(BaseModel):
    scenario: Literal["approved","declined","error"]="approved"
    amount: float=Field(default=0.01,gt=0,le=10000)
    proxy: str=""
    reference: str=""

@app.get("/api/health")
async def health():
    return {"status":"ONLINE","mode":"SANDBOX","time":datetime.now(timezone.utc).isoformat()}

@app.post("/api/run")
async def run(req:RunRequest):
    started=time.perf_counter()
    run_id=str(uuid.uuid4())[:8]
    steps=[]

    async def step(name,status="OK",detail=""):
        await asyncio.sleep(.08)
        steps.append({"step":name,"status":status,"detail":detail})

    await step("SESSION_INIT","OK","Async sandbox session created")
    await step("PROXY_CHECK","OK",req.proxy or "Direct connection / simulated IP")
    await step("LOGIN_PAGE","OK","form_key extracted (simulated)")
    await step("LOGIN","OK","Sandbox account session established")
    await step("ADDCARD_PAGE","OK","address_id + form_key extracted")
    await step("CARD_INFORMATION","OK","Hosted-payment iframe requested")
    await step("UID_EXTRACTION","OK","uID extracted (simulated)")
    await step("IFRAME_PARAMS","OK","Sandbox iframe parameters loaded")

    if req.scenario=="approved":
        status,message="APPROVED","Sandbox authorization approved"
    elif req.scenario=="declined":
        status,message="DECLINED","Sandbox authorization declined"
    else:
        status,message="ERROR","Sandbox processor error"

    await step("PROCESS_PAYMENT",status,message)

    return {
        "id":run_id,
        "status":status,
        "message":message,
        "amount":req.amount,
        "reference":req.reference,
        "proxy":req.proxy or "DIRECT",
        "mode":"SANDBOX",
        "requests":len(steps),
        "latency_ms":round((time.perf_counter()-started)*1000,2),
        "steps":steps,
        "debug_json":{
            "gateway":"SANDBOX_SIMULATOR",
            "sensitive_card_input":"DISABLED",
            "scenario":req.scenario,
            "request_id":run_id
        },
        "timestamp":datetime.now(timezone.utc).isoformat()
    }
