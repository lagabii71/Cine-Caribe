import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useRewards } from '../RewardsContext';

export default function Rewards() {
  const { rewards, addPoints, usePoints, getTier } = useRewards();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  // Calculate progress to next tier
  const getTierProgress = () => {
    const tierThresholds = {
      Bronze: 0,
      Silver: 500,
      Gold: 2000,
      Platinum: 5000
    } as const;
    
    type TierKey = keyof typeof tierThresholds;
    const currentTier = rewards.tier as TierKey;
    const nextTier: TierKey = currentTier === 'Bronze' ? 'Silver' : 
                     currentTier === 'Silver' ? 'Gold' : 
                     currentTier === 'Gold' ? 'Platinum' : 'Platinum';
    
    const currentPoints = rewards.totalPoints;
    const currentThreshold = tierThresholds[currentTier];
    const nextThreshold = tierThresholds[nextTier];
    
    if (currentTier === 'Platinum') return 100;
    
    const progress = ((currentPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(progress, 100);
  };

  // Get tier color
  const getTierColor = () => {
    switch(rewards.tier) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return '#FFD700';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0c1e33', dark: '#0c1e33' }}
      headerImage={
        <Image
          source={require('@/assets/images/CineCaribe - LOGO.png')}
          style={styles.reactLogo}
        />
      }
    >
      {/* Rewards Dashboard */}
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        
        {/* Points Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.background }]}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Your Rewards
          </ThemedText>
          
          <View style={styles.pointsContainer}>
            <View style={styles.pointsColumn}>
              <ThemedText type="defaultSemiBold" style={styles.pointsLabel}>
                Total Points
              </ThemedText>
              <ThemedText type="title" style={styles.pointsValue}>
                {rewards.totalPoints.toLocaleString()}
              </ThemedText>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.pointsColumn}>
              <ThemedText type="defaultSemiBold" style={styles.pointsLabel}>
                Available
              </ThemedText>
              <ThemedText type="title" style={[styles.pointsValue, { color: '#4CAF50' }]}>
                {rewards.availablePoints.toLocaleString()}
              </ThemedText>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.pointsColumn}>
              <ThemedText type="defaultSemiBold" style={styles.pointsLabel}>
                Used
              </ThemedText>
              <ThemedText type="title" style={[styles.pointsValue, { color: '#FF5722' }]}>
                {rewards.usedPoints.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Tier Status */}
        <View style={[styles.tierCard, { backgroundColor: theme.background }]}>
          <View style={styles.tierHeader}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Your Tier
            </ThemedText>
            <View style={[styles.tierBadge, { backgroundColor: getTierColor() }]}>
              <ThemedText type="defaultSemiBold" style={styles.tierText}>
                {rewards.tier}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <ThemedText type="default" style={styles.tierLabel}>Bronze</ThemedText>
              <ThemedText type="default" style={styles.tierLabel}>Silver</ThemedText>
              <ThemedText type="default" style={styles.tierLabel}>Gold</ThemedText>
              <ThemedText type="default" style={styles.tierLabel}>Platinum</ThemedText>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getTierProgress()}%`,
                    backgroundColor: getTierColor()
                  }
                ]} 
              />
            </View>
            
            <ThemedText type="default" style={styles.progressText}>
              {rewards.totalPoints} / 5000 points to Platinum
            </ThemedText>
          </View>
        </View>

        {/* How to Earn Points */}
        <View style={[styles.earnCard, { backgroundColor: theme.background }]}>
          <ThemedText type="title" style={styles.sectionTitle}>
            How to Earn Points
          </ThemedText>
          
          <View style={styles.earnList}>
            <View style={styles.earnItem}>
              <MaterialIcons name="movie" size={24} color={theme.tint} />
              <View style={styles.earnDetails}>
                <ThemedText type="defaultSemiBold">Movie Ticket Purchase</ThemedText>
                <ThemedText type="default" style={styles.earnDescription}>
                  100 points per ticket
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.earnItem}>
              <MaterialIcons name="local-restaurant" size={24} color={theme.tint} />
              <View style={styles.earnDetails}>
                <ThemedText type="defaultSemiBold">Concession Purchase</ThemedText>
                <ThemedText type="default" style={styles.earnDescription}>
                  50 points per $10 spent
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.earnItem}>
              <MaterialIcons name="card-giftcard" size={24} color={theme.tint} />
              <View style={styles.earnDetails}>
                <ThemedText type="defaultSemiBold">Birthday Bonus</ThemedText>
                <ThemedText type="default" style={styles.earnDescription}>
                  500 points on your birthday
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.earnItem}>
              <MaterialIcons name="group" size={24} color={theme.tint} />
              <View style={styles.earnDetails}>
                <ThemedText type="defaultSemiBold">Refer a Friend</ThemedText>
                <ThemedText type="default" style={styles.earnDescription}>
                  250 points per referral
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={[styles.activityCard, { backgroundColor: theme.background }]}>
          <View style={styles.activityHeader}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Recent Activity
            </ThemedText>
            <TouchableOpacity>
              <ThemedText type="link" style={styles.seeAll}>
                See All
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.activityList}>
            {(
              rewards.history.slice(0, 5) as {
              id: string;
              type: 'ticket_purchase' | 'concession_purchase' | 'referral' | 'birthday' | string;
              description: string;
              movieTitle?: string;
              date: string;
              points: number;
              }[]
            ).map((item: {
              id: string;
              type: 'ticket_purchase' | 'concession_purchase' | 'referral' | 'birthday' | string;
              description: string;
              movieTitle?: string;
              date: string;
              points: number;
            }) => (
              <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                {item.type === 'ticket_purchase' && (
                <MaterialIcons name="movie" size={20} color="#4CAF50" />
                )}
                {item.type === 'concession_purchase' && (
                <MaterialIcons name="local-restaurant" size={20} color="#2196F3" />
                )}
                {item.type === 'referral' && (
                <MaterialIcons name="group" size={20} color="#9C27B0" />
                )}
                {item.type === 'birthday' && (
                <MaterialIcons name="cake" size={20} color="#FF9800" />
                )}
              </View>
              
              <View style={styles.activityDetails}>
                <ThemedText type="defaultSemiBold">
                {item.description}
                </ThemedText>
                {item.movieTitle && (
                <ThemedText type="default" style={styles.movieTitle}>
                  {item.movieTitle}
                </ThemedText>
                )}
                <ThemedText type="default" style={styles.activityDate}>
                {formatDate(item.date)}
                </ThemedText>
              </View>
              
              <View style={[
                styles.pointsChange, 
                { backgroundColor: item.points > 0 ? '#E8F5E9' : '#FFEBEE' }
              ]}>
                <ThemedText style={[
                styles.pointsChangeText,
                { color: item.points > 0 ? '#4CAF50' : '#F44336' }
                ]}>
                {item.points > 0 ? '+' : ''}{item.points}
                </ThemedText>
              </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.tint }]}
            onPress={() => console.log('Redeem points')}
          >
            <MaterialIcons name="card-giftcard" size={24} color="#FFFFFF" />
            <ThemedText type="defaultSemiBold" style={styles.actionText}>
              Redeem Points
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.icon }]}
            onPress={() => console.log('Share with friends')}
          >
            <MaterialIcons name="share" size={24} color="#FFFFFF" />
            <ThemedText type="defaultSemiBold" style={styles.actionText}>
              Share & Earn
            </ThemedText>
          </TouchableOpacity>
        </View>

      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  pointsLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tierCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tierLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  earnCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earnList: {
    gap: 16,
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  earnDetails: {
    flex: 1,
  },
  earnDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  activityCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
  },
  activityList: {
    maxHeight: 300,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  activityDate: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },
  pointsChange: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsChangeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});