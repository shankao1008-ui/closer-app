import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Alert,Keyboard,KeyboardAvoidingView,Platform,Pressable,ScrollView,Text,TextInput,View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ArrowLeft,Check,Trash2,MapPin,Heart,Star} from 'lucide-react-native';
import {useRouter} from 'expo-router';
import {useApp} from '../context/AppContext';
import {readWishes,hwRpc,type Wish} from '../lib/heartsWishesApi';
import {usePairRefresh} from '../lib/usePairRefresh';
import {wishHelp} from '../lib/wishHelp';
import {heartsWishesText} from '../lib/heartsWishesText';
export default function Wishes(){const {uid,coupleId}=useApp();return <Screen key={JSON.stringify([uid,coupleId])}/>;}
function Screen(){
 const {uid,coupleId,lang,colors,partnerName}=useApp(),c=heartsWishesText(lang),h=wishHelp(lang),router=useRouter();
 const {data,error,loading,refresh,setData}=usePairRefresh<Wish[]>(uid?coupleId:null,readWishes,[]);
 const [title,setTitle]=useState(''),[category,setCategory]=useState<Wish['category']>('place');
 const [filter,setFilter]=useState<'all'|'todo'|'done'>('all'),[busy,setBusy]=useState(false),[failed,setFailed]=useState<string|null>(null),[saved,setSaved]=useState(false);
 const lock=useRef(false),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const action=async(fn:()=>Promise<void>)=>{
  if(lock.current)return;if(!uid||!coupleId){Alert.alert(c.wishes,c.pair);return;}
  lock.current=true;setBusy(true);setFailed(null);setSaved(false);Keyboard.dismiss();
  try{await fn();if(alive.current)void refresh();}
  catch(error:any){if(alive.current){
   const message=error?.code==='CLIENT_TIMEOUT'?h.timeout:['PGRST202','PGRST205','42P01','42883'].includes(error?.code)?h.setup:c.saveError;
   setFailed(message);Alert.alert(c.wishes,message);console.warn('[Closer wishes] Request failed',error?.code??'unknown');
  }}
  finally{lock.current=false;if(alive.current)setBusy(false);}
 };
 const add=()=>{if(!uid || !coupleId) return; if(!title.trim()){Alert.alert(c.wishes,c.invalid);return;}
  const value=title.trim(),kind=category;
  void action(async()=>{const id=await hwRpc('closer_add_wish',{c:coupleId,t:value,k:kind});if(alive.current){setTitle('');setFilter('all');setSaved(true);setData(old=>old.some(w=>w.id===id)?old:[{id,creator:uid,title:value,category:kind,done:false,created_at:new Date().toISOString()},...old]);}});
 };
 const complete=(w:Wish)=>void action(async()=>{await hwRpc('closer_update_wish',{w:w.id,completed:!w.done,remove_item:false});if(alive.current)setData(old=>old.map(x=>x.id===w.id?{...x,done:!w.done}:x));});
 const remove=(w:Wish)=>Alert.alert(c.confirm,w.title,[{text:c.cancel,style:'cancel'},{text:c.delete,style:'destructive',onPress:()=>{void action(async()=>{await hwRpc('closer_update_wish',{w:w.id,completed:w.done,remove_item:true});if(alive.current)setData(old=>old.filter(x=>x.id!==w.id));});}}]);
 const card={backgroundColor:colors.cardBg,borderRadius:22,padding:18,gap:12};
 const items=data.filter(w=>filter==='all'||(filter==='done'?w.done:!w.done));
 return <View style={{flex:1}}><LinearGradient colors={colors.screenBg as any} style={{position:'absolute',top:0,left:0,bottom:0,right:0}}/><SafeAreaView style={{flex:1}}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,gap:16,paddingBottom:40}}>
  <Pressable accessibilityRole="button" accessibilityLabel={c.back} onPress={()=>router.back()} style={{minHeight:44,justifyContent:'center'}}><ArrowLeft size={24} color={colors.ink}/></Pressable>
  <Text style={{color:colors.ink,fontSize:28,fontWeight:'700'}}>{c.wishes}</Text><Text style={{color:colors.inkSoft}}>{c.wishHint}</Text>
  {!coupleId&&<Text style={{color:colors.ink}}>{c.pair}</Text>}
  <View style={card}>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{(['place','date','goal'] as const).map(k=><Pressable key={k} accessibilityRole="radio" accessibilityState={{selected:category===k}} onPress={()=>setCategory(k)} style={{padding:12,minHeight:44,borderRadius:14,backgroundColor:category===k?colors.primary:colors.hairline}}><Text style={{color:category===k?'#fff':colors.ink}}>{c[k]}</Text></Pressable>)}</View>
   <TextInput accessibilityLabel={c.placeholder} editable={!busy} placeholder={c.placeholder} placeholderTextColor={colors.inkSoft} value={title} onChangeText={setTitle} maxLength={120} multiline style={{minHeight:80,color:colors.ink,padding:14,backgroundColor:colors.hairline,borderRadius:14,textAlignVertical:'top'}}/>
   <Pressable accessibilityRole="button" disabled={busy} onPress={add} style={{padding:14,borderRadius:14,backgroundColor:colors.primary,opacity:busy?0.5:1}}>{busy?<ActivityIndicator color="#fff"/>:<Text style={{color:'#fff',fontWeight:'700',textAlign:'center'}}>{c.add}</Text>}</Pressable>
  </View>
  {failed&&<Text accessibilityRole="alert" style={{color:colors.ink}}>{failed}</Text>}
  {saved&&<Text accessibilityLiveRegion="polite" style={{color:colors.primaryDeep}}>{h.saved}</Text>}
  {error&&<Pressable accessibilityRole="button" onPress={()=>{void refresh();}} style={{padding:12}}><Text style={{color:colors.ink}}>{c.error} {c.retry}</Text></Pressable>}
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{(['all','todo','done'] as const).map(f=><Pressable key={f} accessibilityRole="tab" accessibilityState={{selected:filter===f}} onPress={()=>setFilter(f)} style={{padding:12,minHeight:44,borderRadius:14,backgroundColor:filter===f?colors.primary:colors.cardBg}}><Text style={{color:filter===f?'#fff':colors.ink}}>{h[f]} ({data.filter(w=>f==='all'||(f==='done'?w.done:!w.done)).length})</Text></Pressable>)}</View>
  <Text style={{color:colors.inkSoft,fontSize:13}}>{h.guide}</Text>
  {loading&&<ActivityIndicator color={colors.primary}/>}
  {!loading&&!error&&!items.length&&<View style={card}><Star size={30} color={colors.primary}/><Text style={{color:colors.inkSoft}}>{h.empty}</Text></View>}
  {items.map(w=><View key={w.id} style={card}>
   <View style={{flex:1,gap:8}}><Text style={{color:colors.ink,fontSize:16,fontWeight:'600',textDecorationLine:w.done?'line-through':'none'}}>{w.title}</Text><View style={{flexDirection:'row',alignItems:'center',gap:5}}>{w.category==='place'?<MapPin size={13} color={colors.inkSoft}/>:w.category==='date'?<Heart size={13} color={colors.inkSoft}/>:<Star size={13} color={colors.inkSoft}/>}<Text style={{color:colors.inkSoft,fontSize:12,flex:1}}>{c[w.category]} · {w.creator===uid?c.me:(partnerName||c.partner)}</Text></View></View>
   <Text style={{color:colors.inkSoft,fontSize:12}}>{w.done?h.done:h.todo}</Text>
   <Pressable accessibilityRole="button" accessibilityState={{disabled:busy}} disabled={busy} onPress={()=>complete(w)} style={{minHeight:46,padding:12,borderRadius:14,backgroundColor:w.done?colors.hairline:colors.primary,alignItems:'center',justifyContent:'center',opacity:busy?0.5:1}}><Text style={{color:w.done?colors.ink:'#fff',fontWeight:'700'}}>{w.done?h.undo:h.mark}</Text></Pressable>
   {w.creator===uid&&<Pressable accessibilityRole="button" accessibilityLabel={`${c.delete}: ${w.title}`} disabled={busy} onPress={()=>remove(w)} style={{width:44,height:44,alignItems:'center',justifyContent:'center'}}><Trash2 size={19} color={colors.inkSoft}/></Pressable>}
  </View>)}
 </ScrollView></KeyboardAvoidingView></SafeAreaView></View>;
}
