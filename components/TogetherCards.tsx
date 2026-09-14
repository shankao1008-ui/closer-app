import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {useRouter} from 'expo-router';
import {useApp} from '../context/AppContext';
import {togetherText} from '../lib/togetherText';
import {Images,Clock} from 'lucide-react-native';
export default function TogetherCards(){
 const {lang,colors}=useApp();const c=togetherText(lang),router=useRouter();
 return <View style={{gap:12}}>{(['moment','overlap'] as const).map(mode=><Pressable key={mode} accessibilityRole="button" onPress={()=>router.push({pathname:'/together' as any,params:{view:mode}})} style={{backgroundColor:colors.cardBg,borderRadius:20,padding:18,flexDirection:'row',alignItems:'center',gap:12}}>
 {mode==='moment'?<Images size={24} color={colors.primary}/>:<Clock size={24} color={colors.primary}/>}
 <Text style={{color:colors.ink,fontWeight:'700',fontSize:17,flex:1}}>{c[mode]}</Text>
 </Pressable>)}</View>;
}
