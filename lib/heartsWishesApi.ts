import { supabase } from './supabase';
export type Wish={id:string;creator:string;title:string;category:'place'|'date'|'goal';done:boolean;created_at:string};
export type Heart={sender:string;recipient:string;sent_at:string};
export async function readHearts(c:string):Promise<Heart[]>{
 const r=await supabase.from('closer_hearts').select('sender,recipient,sent_at').eq('couple_id',c);
 if(r.error)throw r.error;return r.data??[];
}
export async function readWishes(c:string):Promise<Wish[]>{
 const r=await supabase.from('closer_wishes').select('id,creator,title,category,done,created_at').eq('couple_id',c).order('created_at',{ascending:false}).limit(300);
 if(r.error)throw r.error;return r.data??[];
}
export async function hwRpc(name:string,args:Record<string,unknown>){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),20000);
 try{
  const r=await supabase.rpc(name,args).abortSignal(controller.signal);
  if(controller.signal.aborted)throw {code:'CLIENT_TIMEOUT'};
  if(r.error)throw r.error;return r.data;
 }catch(error){if(controller.signal.aborted)throw {code:'CLIENT_TIMEOUT'};throw error;}
 finally{clearTimeout(timer);}
}
