import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '@/theme/tokens';

export function AccountHero() {
  return <View style={styles.frame}>
    <Image
      source={require('../../assets/images/finteen/welcome-family-v2.png')}
      style={styles.image}
      contentFit="cover"
      contentPosition="center"
      transition={250}
    />
    <View style={styles.shade} />
    <View style={styles.caption}>
      <View style={styles.spark}><Text style={styles.sparkText}>✦</Text></View>
      <View style={styles.captionCopy}><Text style={styles.captionLabel}>CÙNG NHAU TIẾN BỘ</Text><Text style={styles.captionText}>Hiểu con qua từng hành trình</Text></View>
    </View>
  </View>;
}

const styles=StyleSheet.create({frame:{height:276,borderRadius:radius.xxl,overflow:'hidden',backgroundColor:colors.greenSoft,...shadow.large},image:{width:'100%',height:'100%'},shade:{position:'absolute',left:0,right:0,bottom:0,height:100,backgroundColor:'rgba(18,53,38,.18)'},caption:{position:'absolute',left:14,right:14,bottom:14,minHeight:58,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:12,paddingVertical:10,borderRadius:17,backgroundColor:'rgba(24,56,42,.93)',...shadow.card},spark:{width:35,height:35,borderRadius:12,backgroundColor:colors.yellow,alignItems:'center',justifyContent:'center'},sparkText:{color:colors.ink,fontSize:18,fontWeight:'900'},captionCopy:{flex:1},captionLabel:{color:'#A9D6C0',fontSize:7,fontWeight:'900',letterSpacing:.8},captionText:{color:colors.white,fontSize:12,fontWeight:'900',marginTop:3}});
