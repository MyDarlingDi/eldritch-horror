const HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
const ALPHABET="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:HEADERS});

async function ensure(db){
  await db.prepare("CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at INTEGER NOT NULL, created_at INTEGER NOT NULL)").run();
}

function roomCode(){
  const bytes=new Uint8Array(6);crypto.getRandomValues(bytes);
  return Array.from(bytes,x=>ALPHABET[x%ALPHABET.length]).join("");
}

async function readBody(request){
  const raw=await request.text();
  if(raw.length>500000)throw new Error("too_large");
  const data=JSON.parse(raw);
  if(!data.state||typeof data.state!=="object")throw new Error("bad_state");
  return data;
}

export async function onRequest(context){
  const {request,env,params}=context;
  if(!env.DB)return json({error:"database_not_connected"},503);
  await ensure(env.DB);
  const code=String(params.code||"").toUpperCase();

  try{
    if(request.method==="POST"&&!code){
      const {state}=await readBody(request),value=JSON.stringify(state);
      for(let i=0;i<8;i++){
        const next=roomCode(),now=Date.now();
        const result=await env.DB.prepare("INSERT OR IGNORE INTO rooms (code,state_json,updated_at,created_at) VALUES (?,?,?,?)").bind(next,value,now,now).run();
        if(result.meta.changes===1)return json({code:next,updatedAt:now},201);
      }
      return json({error:"room_code_unavailable"},503);
    }

    if(!/^[A-Z2-9]{6}$/.test(code))return json({error:"invalid_room_code"},400);

    if(request.method==="GET"){
      const found=await env.DB.prepare("SELECT state_json,updated_at FROM rooms WHERE code=?").bind(code).first();
      if(!found)return json({error:"room_not_found"},404);
      return json({state:JSON.parse(found.state_json),updatedAt:found.updated_at});
    }

    if(request.method==="PUT"){
      const {state,baseUpdatedAt}=await readBody(request);
      const current=await env.DB.prepare("SELECT updated_at FROM rooms WHERE code=?").bind(code).first();
      if(!current)return json({error:"room_not_found"},404);
      if(baseUpdatedAt&&current.updated_at!==baseUpdatedAt)return json({error:"room_changed",updatedAt:current.updated_at},409);
      const now=Math.max(Date.now(),current.updated_at+1);
      await env.DB.prepare("UPDATE rooms SET state_json=?,updated_at=? WHERE code=?").bind(JSON.stringify(state),now,code).run();
      return json({updatedAt:now});
    }

    return json({error:"method_not_allowed"},405);
  }catch(error){
    const message=error instanceof Error?error.message:"invalid_request";
    return json({error:message},message==="too_large"?413:400);
  }
}
