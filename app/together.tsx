import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Heart, ImagePlus, RefreshCw } from "lucide-react-native";
import { togetherDesignText } from "../lib/togetherDesignText";
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Alert,AppState,Image,Pressable,ScrollView,Text,TextInput,View} from 'react-native';
import {useFocusEffect,useLocalSearchParams,useRouter} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {useApp} from '../context/AppContext';
import {loadTogether,sendMoment,togetherRpc,type TogetherData} from '../lib/togetherApi';
import {localTime,parseClock,type Slot} from '../lib/overlap';
import {togetherText} from '../lib/togetherText';
const empty:TogetherData={moments:[],availability:[],plans:[]};
export default function Together(){const {uid,coupleId}=useApp();return <TogetherScreen key={JSON.stringify([uid,coupleId])}/>;}
function TogetherScreen(){
 const {uid,coupleId,lang,colors,myCity,myName,partnerName}=useApp();
 const router=useRouter(),params=useLocalSearchParams<{view?:string}>();
 const [mode,setMode]=useState(params.view==='overlap'?'overlap':'moment');
 const c=togetherText(lang);
 const design=togetherDesignText(lang);
 const paired=!!uid&&!!coupleId;
 const [data,setData]=useState<TogetherData>(empty),[loading,setLoading]=useState(!!uid&&!!coupleId),[busy,setBusy]=useState(false);
 const [notice,setNotice]=useState<'error'|'saved'|'invalid'|'permission'|null>(null);
 const [caption,setCaption]=useState('');
 const [selectedUri,setSelectedUri]=useState<string|null>(null);
 const [picking,setPicking]=useState(false);
 const [slots,setSlots]=useState<Slot[]>([]),[zone,setZone]=useState(myCity.tz);
 const [days,setDays]=useState<number[]>([]),[from,setFrom]=useState('19:00'),[until,setUntil]=useState('20:00');
 const initialized=useRef(false),inFlight=useRef(false),mounted=useRef(true);
 const cache=useRef(new Map<string,{url:string;at:number}>());
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const load=useCallback(async()=>{
  if(!uid||!coupleId)return;
  if(inFlight.current)return;
  inFlight.current=true;
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
   const next=await Promise.race([loadTogether(coupleId),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),15000);})]);
   if(!mounted.current)return;
   for(const m of next.moments)for(const p of m.photos){const old=cache.current.get(p.storage_path);if(old&&Date.now()-old.at<1800000)p.url=old.url;else cache.current.set(p.storage_path,{url:p.url,at:Date.now()});}
   setData(next);
   if(!initialized.current){const own=next.availability.find(x=>x.user_id===uid);setSlots(own?.slots??[]);setZone(own?.tz??myCity.tz);initialized.current=true;}
  }catch{if(mounted.current)setNotice('error');}
  finally{clearTimeout(timer);inFlight.current=false;if(mounted.current)setLoading(false);}
 },[uid,coupleId,myCity.tz]);
 useFocusEffect(useCallback(()=>{
  void load();
  const timer=setInterval(()=>{if(AppState.currentState==='active')void load();},20000);
  const sub=AppState.addEventListener('change',s=>{if(s==='active')void load();});
  return()=>{clearInterval(timer);sub.remove();};
 },[load]));
 const action=async(fn:()=>Promise<void|false>)=>{if(busy||!paired||!initialized.current)return;setBusy(true);setNotice(null);try{const result=await fn();if(result===false)return;if(mounted.current){setNotice('saved');await load();}}catch{if(mounted.current)setNotice('error');}finally{if(mounted.current)setBusy(false);}};
 const weekday=(d:number)=>new Intl.DateTimeFormat(lang,{weekday:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2026,0,4+d)));
 const clock=(m:number)=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
 const display=(date:string|number,tz:string)=>{try{return localTime(date,tz,lang);}catch{return String(date);}};
 const button=(label:string,fn:()=>void,disabled=false,primary=false)=><Pressable accessibilityRole="button" disabled={disabled||busy} onPress={fn} style={{padding:12,minHeight:44,borderRadius:13,backgroundColor:primary?colors.primary:colors.hairline,opacity:disabled||busy?0.5:1}}><Text style={{color:primary?'#fff':colors.ink,fontWeight:'600',textAlign:'center',fontSize:13}}>{label}</Text></Pressable>;
 const textStyle={color:colors.ink},soft={color:colors.inkSoft,fontSize:12},card={backgroundColor:colors.cardBg,padding:16,borderRadius:22,gap:12};
 const inputStyle={color:colors.ink,backgroundColor:colors.hairline,padding:12,borderRadius:10};
 const pick=async()=>{
  if(picking||busy)return;
  setPicking(true);setNotice(null);
  try{
   const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
   if(!permission.granted){setNotice('permission');return;}
   const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:0.8});
   if(!result.canceled&&result.assets?.[0]&&mounted.current)setSelectedUri(result.assets[0].uri);
  }catch{if(mounted.current)setNotice('error');}
  finally{if(mounted.current)setPicking(false);}
 };
 const latest=data.moments[0];
 const waitingForPartner=!!latest&&latest.photos.length<2&&latest.photos.some(p=>p.user_id===uid);
 const sending=useRef(false);
 const upload=async()=>{
  if(sending.current||busy||picking)return;
  if(!selectedUri){Alert.alert(c.moment,c.addPhoto);return;}
  if(!paired){Alert.alert(c.moment,c.pair);return;}
  if(waitingForPartner){Alert.alert(c.moment,c.waiting);return;}
  sending.current=true;setBusy(true);setNotice(null);
  try{
   await sendMoment(coupleId!,uid!,selectedUri,myCity.name,myCity.tz,caption.trim());
   if(mounted.current){setSelectedUri(null);setCaption('');setNotice('saved');await load();}
  }catch(error){
   if(mounted.current){setNotice('error');Alert.alert(c.moment,c.error);}
  }finally{sending.current=false;if(mounted.current)setBusy(false);}
 };
 const add=()=>{const a=parseClock(from),b=until==='24:00'?1440:parseClock(until);if(!days.length||a===null||b===null||a>=b||slots.length+days.length>28){setNotice('invalid');return;}
  const next=[...slots];for(const d of days)if(!next.some(s=>s.day===d&&s.start===a&&s.end===b))next.push({day:d,start:a,end:b});setSlots(next.sort((a,b)=>a.day-b.day||a.start-b.start));setNotice(null);
 };
 return <View style={{flex:1}}><LinearGradient colors={colors.screenBg as any} style={{position:'absolute',top:0,bottom:0,left:0,right:0}}/><SafeAreaView style={{flex:1}}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,gap:16,paddingBottom:40}}>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
   <Pressable accessibilityRole="button" accessibilityLabel={c.close} onPress={()=>router.back()} style={{minWidth:44,minHeight:44,justifyContent:'center'}}><ArrowLeft size={23} color={colors.ink}/></Pressable>
   <View style={{flexDirection:'row',alignItems:'center',gap:6}}><Text style={{fontSize:24,fontWeight:'700',color:colors.ink}}>closer</Text><Heart size={18} color={colors.primary}/></View>
   <Pressable accessibilityRole="button" accessibilityLabel={c.refresh} onPress={()=>{setNotice(null);void load();}} style={{minWidth:44,minHeight:44,alignItems:'flex-end',justifyContent:'center'}}><RefreshCw size={19} color={colors.inkSoft}/></Pressable>
  </View>
  <View style={{flexDirection:'row',gap:4,padding:4,borderRadius:16,backgroundColor:colors.hairline}}>{(['moment','overlap'] as const).map(tab=><Pressable key={tab} accessibilityRole="tab" accessibilityState={{selected:mode===tab}} onPress={()=>setMode(tab)} style={{flex:1,minHeight:46,alignItems:'center',justifyContent:'center',padding:8,borderRadius:12,backgroundColor:mode===tab?colors.cardBg:'transparent'}}><Text style={{color:mode===tab?colors.ink:colors.inkSoft,fontSize:13,fontWeight:mode===tab?'700':'400',textAlign:'center'}}>{c[tab]}</Text></Pressable>)}</View>
  <View><Text style={{fontSize:27,fontWeight:'700',color:colors.ink,marginBottom:7}}>{mode==='moment'?c.moment:c.overlap}</Text><Text style={soft}>{mode==='moment'?design.moment:design.overlap}</Text></View>
  {!paired&&<View style={card}><Text style={textStyle}>{c.pair}</Text></View>}
  {loading&&<ActivityIndicator accessibilityLabel={c.loading} color={colors.primary}/>}
  {notice&&<Text accessibilityRole="alert" style={textStyle}>{notice==='permission'?design.permission:c[notice]}</Text>}
   {mode==='moment'?<>
    {(data.moments.length?data.moments:[{id:'empty',created_at:'',photos:[]}]).map((m,index)=><React.Fragment key={m.id}>
     {index===1&&<Text style={{...soft,fontWeight:'700',marginTop:8}}>{design.memories}</Text>}
     <View style={card}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}><Text style={{...soft,flex:1}}>{m.created_at?display(m.created_at,myCity.tz):c.empty}</Text><Text style={{fontSize:12,color:colors.primaryDeep,backgroundColor:colors.hairline,padding:7,borderRadius:12}}>{m.photos.length} / 2</Text></View>
      <View style={{flexDirection:'row',gap:10}}>{[true,false].map(mine=>{const p=m.photos.find(p=>(p.user_id===uid)===mine);return <View key={String(mine)} style={{flex:1,gap:6}}>
       {mine&&index===0&&!p?<Pressable accessibilityRole="button" accessibilityLabel={c.addPhoto} disabled={picking||busy} onPress={()=>{void pick();}} style={{aspectRatio:0.8,backgroundColor:colors.hairline,borderRadius:15,overflow:'hidden',justifyContent:'center',alignItems:'center',gap:12,borderStyle:'dashed',borderWidth:1,borderColor:colors.cardBorder}}>
        {selectedUri?<Image source={{uri:selectedUri}} accessibilityLabel={design.preview} style={{width:'100%',height:'100%'}} resizeMode="cover"/>:<><ImagePlus size={26} color={colors.inkSoft}/><Text style={{...soft,textAlign:'center'}}>{c.addPhoto}</Text></>}
       </Pressable>:p?<Image source={{uri:p.url}} accessibilityLabel={mine?myName:partnerName} onError={()=>{cache.current.delete(p.storage_path);setNotice('error');}} style={{width:'100%',aspectRatio:0.8,borderRadius:15}} resizeMode="cover"/>:<View style={{aspectRatio:0.8,backgroundColor:colors.hairline,borderRadius:15,padding:12,justifyContent:'center',alignItems:'center',gap:12}}><ImagePlus size={26} color={colors.inkSoft}/><Text style={{...soft,textAlign:'center'}}>{mine?c.addPhoto:c.waiting}</Text></View>}
       <Text style={{...textStyle,fontWeight:'700',fontSize:13}}>{mine?(myName||c.me):(paired?partnerName:c.partner)}</Text>
       {p&&<><Text style={soft}>{p.city} · {display(p.created_at,p.tz)}</Text><Text style={{...textStyle,fontSize:13,lineHeight:20}}>{p.caption}</Text></>}
      </View>;})}</View>
     </View>
     {index===0&&(<View style={card}>
     {selectedUri&&latest?.photos.some(p=>p.user_id===uid)&&<Image source={{uri:selectedUri}} accessibilityLabel={design.preview} style={{width:'100%',aspectRatio:0.8,borderRadius:15}} resizeMode="contain"/>}
     {latest?.photos.some(p=>p.user_id===uid)&&!waitingForPartner&&button(c.addPhoto,()=>{void pick();},picking)}
     {picking&&<ActivityIndicator color={colors.primary}/>}
     <TextInput accessibilityLabel={c.caption} placeholder={c.caption} placeholderTextColor={colors.inkSoft} maxLength={200} value={caption} onChangeText={setCaption} style={inputStyle}/>
     {waitingForPartner&&<Text style={soft}>{c.waiting}</Text>}
     {paired&&!initialized.current&&!loading&&<Text style={soft}>{design.retry}</Text>}
     
    </View>)}
    </React.Fragment>)}
   </>:<>
    <View style={card}>
     <Text style={{...textStyle,fontSize:18,fontWeight:'700'}}>{c.availability}</Text>
     <Text style={soft}>{c.timezone}: {zone}</Text>{button(c.useCity,()=>setZone(myCity.tz))}
     <View style={{flexDirection:'row',flexWrap:'wrap',gap:5}}>{[1,2,3,4,5,6,0].map(d=><Pressable key={d} accessibilityRole="checkbox" accessibilityState={{checked:days.includes(d)}} onPress={()=>setDays(days.includes(d)?days.filter(x=>x!==d):[...days,d])} style={{minWidth:40,minHeight:44,padding:10,borderRadius:12,backgroundColor:days.includes(d)?colors.primary:colors.hairline}}><Text style={{color:days.includes(d)?'#fff':colors.ink}}>{weekday(d)}</Text></Pressable>)}</View>
     <Text style={soft}>{c.start} / {c.end} (HH:MM)</Text>
     <View style={{flexDirection:'row',gap:8}}><TextInput accessibilityLabel={c.start} value={from} onChangeText={setFrom} maxLength={5} style={{...inputStyle,flex:1}}/><TextInput accessibilityLabel={c.end} value={until} onChangeText={setUntil} maxLength={5} style={{...inputStyle,flex:1}}/></View>
     <Text style={soft}>{c.invalid}</Text>
     {button(c.add,add)}
     {slots.map((s,i)=><View key={`${s.day}-${s.start}-${s.end}-${i}`} style={{flexDirection:'row',alignItems:'center',gap:8}}><Text style={{...textStyle,flex:1}}>{weekday(s.day)} {clock(s.start)}–{clock(s.end)}</Text>{button(c.remove,()=>setSlots(slots.filter((_,j)=>i!==j)))}</View>)}
     {button(c.save,()=>{void action(()=>togetherRpc('closer_save_availability',{c:coupleId,z:zone,s:slots}));},!paired||loading||!initialized.current,true)}
    </View>
   </>}
   {busy&&<ActivityIndicator color={colors.primary}/>}
 </ScrollView>
 {mode==='moment'&&<View style={{paddingHorizontal:20,paddingVertical:12,backgroundColor:colors.cardBg,borderTopWidth:1,borderTopColor:colors.cardBorder}}>
  {button(busy?c.loading:design.send,()=>{void upload();},picking,true)}
 </View>}
 </SafeAreaView></View>;
}
