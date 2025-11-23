import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs, useRouter } from 'expo-router';
import * as React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ShoppingCartProvider } from '../ShoppingCartContext';
import { AppStateProvider } from './AppStateContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const theme = Colors[colorScheme ?? 'dark'];
  const styles = getStyles(theme);

  const Header = () => {
    return (
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: theme.background, borderColor: theme.icon },
        ]}
      >
        {/* Left: Notifications */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/notifications')}
        >
          <MaterialIcons name="notifications" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Right: Cart */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/cart')}
        >
          <MaterialIcons name="shopping-cart" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AppStateProvider>
      <ShoppingCartProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: theme.tint,
        tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: '#0c1e33',
            borderRadius: 30,
            height: 80,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 0,        // 👈 explicitly remove top border
            elevation: 8,             // Android shadow
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
          },
            headerShown: true,
            header: () => <Header />,
            tabBarButton: HapticTab,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: '',
              tabBarIcon: ({ color }) => (
                <MaterialIcons size={28} name="home" color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="movies"
            options={{
              title: 'Movies',
              tabBarIcon: ({ color }) => (
                <Image
                  source={require('../../assets/images/movies.png')}
                  style={{ width: 30, height: 30, tintColor: color }}
                  resizeMode="contain"
                />
              ),
            }}
          />

          <Tabs.Screen
            name="concession"
            options={{
              title: 'Food',
              tabBarIcon: ({ color }) => (
                <Image
                  source={require('../../assets/images/drinks.png')}
                  style={{ width: 30, height: 30, tintColor: color }}
                  resizeMode="contain"
                />
              ),
            }}
          />

          <Tabs.Screen
            name="rewards"
            options={{
              title: '',
              tabBarIcon: () => (
                <View style={styles.rewardsWrapper}>
                  <Image
                    source={require('../../assets/images/rewards.png')}
                    style={styles.rewardsIcon}
                    resizeMode="contain"
                  />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="theaters"
            options={{
              title: 'Theaters',
              tabBarIcon: ({ color }) => (
                <Image
                  source={require('../../assets/images/location.png')}
                  style={{ width: 30, height: 30, tintColor: color }}
                  resizeMode="contain"
                />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => (
                <Image
                  source={require('../../assets/images/user.png')}
                  style={{ width: 30, height: 30, tintColor: color }}
                  resizeMode="contain"
                />
              ),
            }}
          />

          <Tabs.Screen
            name="cart"
            options={{
              title: '',
              tabBarIcon: ({ color }) => (
                <MaterialIcons size={28} name="shopping-cart" color={color} />
              ),
            }}
          />
        </Tabs>
      </ShoppingCartProvider>
    </AppStateProvider>
  );
}
const getStyles = (themeParam: any) =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
    },
    iconButton: {
      marginLeft: 12,
    },

    rewardsWrapper: {
      position: 'absolute',
      left: 10,
      transform: [{ translateX: -45 }], // half of width to center
      width: 105,
      height: 90,
      borderRadius: 35,
      borderWidth: 0,
      borderColor: Colors.dark.icon,
      backgroundColor: '#0c1e33',
      justifyContent: 'center',
      alignItems: 'center',
     // shadowColor: '#000',
   //   shadowOffset: { width: 0, height: 4 },
    //  shadowOpacity: 0.3,
    //  shadowRadius: 6,
      elevation: 10,
    },

    rewardsIcon: {
      width: 90,
      height: 90,
      marginLeft: 10,
      tintColor: Colors.dark.cinema, // or theme.cinema
    },
  });
