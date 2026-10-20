import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Pressable,Text,View} from 'react-native';
import {Heart,ListChecks,ChevronRight} from 'lucide-react-native';
import {useRouter} from 'expo-router';
import {useApp} from '../context/AppContext';
import {readHearts,hwRpc,type Heart as HeartData} from '../lib/heartsWishesApi';
import {usePairRefresh} from '../lib/usePairRefresh';
import {heartsWishesText} from '../lib/heartsWishesText';
export default function HeartsWishesCards(){const {uid,coupleId}=useApp();return <Cards key={JSON.stringify([uid,coupleId])}/>;}
function Cards(){
 const {uid,coupleId,partnerName,colors,lang}=useApp(),router=useRouter(),c=heartsWishesText(lang);
 const {data,error,loading,refresh}=usePairRefresh<HeartData[]>(uid?coupleId:null,readHearts,[]);
 const [busy,setBusy]=useState(false),[sent,setSent]=useState(false),[failed,setFailed]=useState(false);
 const lock=useRef(false),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const send=async()=>{if(lock.current||!uid||!coupleId)return;lock.current=true;setBusy(true);setFailed(false);setSent(false);
  try{await hwRpc('closer_send_heart',{c:coupleId});if(alive.current){setSent(true);void refresh();}}
  catch{if(alive.current)setFailed(true);}
  finally{lock.current=false;if(alive.current)setBusy(false);}
 };
 const received=data.filter(h=>h.recipient===uid).sort((a,b)=>b.sent_at.localeCompare(a.sent_at))[0];
 const card={backgroundColor:colors.cardBg,borderRadius:28,padding:22,gap:12};
 return <View style={{gap:12}}>
  <View style={{...card,backgroundColor:"#FCE3E1"}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:14}}>
    <View style={{flex:1,gap:6}}><Text style={{color:colors.ink,fontWeight:'700',fontSize:18}}>{c.heart}</Text><Text style={{color:colors.inkSoft,fontSize:13}}>{c.hint}</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel={c.send} accessibilityState={{disabled:!uid||!coupleId||busy,busy}} disabled={!uid||!coupleId||busy} onPress={()=>{void send();}} style={({pressed})=>({width:76,height:76,borderRadius:27,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',opacity:!coupleId||busy?0.45:pressed?0.7:1,transform:[{scale:pressed?0.94:1}]})}>
     {busy?<ActivityIndicator color="#fff"/>:<Heart size={30} fill="#fff" color="#fff"/>}
    </Pressable>
   </View>
   {!coupleId?<Text style={{color:colors.inkSoft}}>{c.pair}</Text>:<>
    {loading&&<ActivityIndicator color={colors.primary}/>}
    {received?<View style={{backgroundColor:colors.hairline,borderRadius:14,padding:12,gap:5}}><Text accessibilityLiveRegion="polite" style={{color:colors.ink,fontWeight:'600'}}>{c.received.replace('{name}',partnerName||c.partner)}</Text><Text style={{color:colors.inkSoft,fontSize:12}}>{new Date(received.sent_at).toLocaleString(lang)}</Text></View>:!loading&&!error&&<Text style={{color:colors.inkSoft,fontSize:12}}>{c.none}</Text>}
    {sent&&<Text accessibilityLiveRegion="polite" style={{color:colors.primaryDeep}}>{c.sent}</Text>}
    {(error||failed)&&<Pressable accessibilityRole="button" onPress={()=>{setFailed(false);void refresh();}} style={{paddingVertical:10}}><Text style={{color:colors.ink}}>{c.error} {c.retry}</Text></Pressable>}
   </>}
  </View>
  <Pressable accessibilityRole="button" onPress={()=>router.push('/wishes' as any)} style={{...card,flexDirection:'row',alignItems:'center',gap:12}}>
   <ListChecks size={26} color={colors.primary}/><View style={{flex:1,gap:5}}><Text style={{color:colors.ink,fontWeight:'700',fontSize:18}}>{c.wishes}</Text><Text style={{color:colors.inkSoft,fontSize:12}}>{c.wishHint}</Text></View><ChevronRight size={20} color={colors.inkSoft}/>
  </Pressable>
 </View>;
}
