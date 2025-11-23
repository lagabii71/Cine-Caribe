import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, View } from 'react-native';

export default function Movies() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0c1e33', dark: '#0c1e33' }}
      headerImage={<View style={styles.headerImage} />}
>  
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create( {
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
    reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});