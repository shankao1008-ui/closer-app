import { supabase } from './supabase';
import { File } from 'expo-file-system';
import * as Manipulator from 'expo-image-manipulator';
import type { Availability } from './overlap';
export type MomentPhoto={moment_id:string;user_id:string;city:string;tz:string;caption:string;created_at:string;storage_path:string;url:string};
export type Moment={id:string;created_at:string;photos:MomentPhoto[]};
export type Plan={id:string;creator:string;starts_at:string;status:'pending'|'confirmed'|'declined'|'cancelled'};
export type TogetherData={moments:Moment[];availability:Availability[];plans:Plan[]};
export async function loadTogether(coupleId:string):Promise<TogetherData>{
 const [m,a]=await Promise.all([
  supabase.from('closer_moments').select('id,created_at').eq('couple_id',coupleId).order('created_at',{ascending:false}).limit(10),
  supabase.from('closer_availability').select('user_id,tz,slots').eq('couple_id',coupleId),
 ]);
 if(m.error||a.error)throw m.error||a.error;
 let photos:MomentPhoto[]=[];
 if(m.data?.length){
  const r=await supabase.from('closer_moment_photos').select('*').in('moment_id',m.data.map(x=>x.id));
  if(r.error)throw r.error;
  const signed=r.data?.length ? await supabase.storage.from('closer-moments').createSignedUrls((r.data??[]).map(x=>x.storage_path),3600) : {data:[],error:null};
  if(signed.error)throw signed.error;
  photos=(r.data??[]).map(x=>({...x,url:signed.data?.find(v=>v.path===x.storage_path)?.signedUrl??''}));
 }
 return {moments:(m.data??[]).map(x=>({...x,photos:photos.filter(p=>p.moment_id===x.id)})),availability:a.data??[],plans:[]};
}
export async function sendMoment(c:string,uid:string,uri:string,city:string,tz:string,caption:string){
 const image=await Manipulator.manipulateAsync(uri,[{resize:{width:1200}}],{compress:0.8,format:Manipulator.SaveFormat.JPEG});
 const file=new File(image.uri);
 try{
  if(!file.exists||file.size>10485760)throw new Error('Image too large');
  const m=await supabase.rpc('closer_start_moment',{c});if(m.error)throw m.error;
  const path=`${c}/${uid}/${m.data}.jpg`;
  const up=await supabase.storage.from('closer-moments').upload(path,await file.arrayBuffer(),{contentType:'image/jpeg',upsert:false});
  if(up.error)throw up.error;
  const row=await supabase.from('closer_moment_photos').insert({moment_id:m.data,user_id:uid,storage_path:path,city,tz,caption});
  if(row.error){await supabase.storage.from('closer-moments').remove([path]);throw row.error;}
 }finally{if(file.exists)file.delete();}
}
export async function togetherRpc(name:string,args:Record<string,unknown>){const r=await supabase.rpc(name,args);if(r.error)throw r.error;}
