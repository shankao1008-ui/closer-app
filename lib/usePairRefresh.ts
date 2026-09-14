import {useCallback,useRef,useState,type SetStateAction} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from 'expo-router';
// Mount callers with an account/pair key so no data crosses account changes.
export function usePairRefresh<T>(pair:string|null,read:(c:string)=>Promise<T>,initial:T){
 const [data,rawSetData]=useState<T>(initial),[error,setError]=useState(false),[loading,setLoading]=useState(!!pair);
 const alive=useRef(false),flight=useRef(false),revision=useRef(0);
 const setData=useCallback((value:SetStateAction<T>)=>{revision.current++;rawSetData(value);},[]);
 const refresh=useCallback(async()=>{
  if(!pair||flight.current||!alive.current)return;
  flight.current=true;const rev=revision.current;
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
   const next=await Promise.race([read(pair),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),15000);})]);
   if(alive.current&&revision.current===rev){rawSetData(next);setError(false);}
  }catch{if(alive.current&&revision.current===rev)setError(true);}
  finally{clearTimeout(timer);flight.current=false;if(alive.current)setLoading(false);}
 },[pair,read]);
 useFocusEffect(useCallback(()=>{
  alive.current=true;void refresh();
  const timer=setInterval(()=>{if(AppState.currentState==='active')void refresh();},10000);
  const sub=AppState.addEventListener('change',s=>{if(s==='active')void refresh();});
  return()=>{alive.current=false;revision.current++;clearInterval(timer);sub.remove();};
 },[refresh]));
 return {data,error,loading,refresh,setData};
}
