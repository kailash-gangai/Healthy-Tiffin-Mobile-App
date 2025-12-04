import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { RootStackParamList } from './navigation/types';
import { RootState } from '../store';
import HeaderImage from '../assets/newicon/header-image.svg';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';

type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  navigation: AboutScreenNavigationProp;
};

const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.user);

  const handlePress = () => {
    if (!user || user.customerToken === null || user.customerToken === '') {
      navigation.navigate('SignIn');
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <View
      style={styles.safe}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom  }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Image */}
        <Image
          source={require('../assets/banners/KalaChanaChaatSalad.webp')}
          style={styles.headerImage}
          resizeMode="cover"
        />

        {/* 2. Green Section with Text */}
        <View style={[styles.greenSection, { position: 'relative' }]}>
          <Text style={styles.greenText}>
            <Text style={{ fontWeight: 'bold' }}>Fresh</Text> healthy meal{'\n'}
            delivered <Text style={{ fontWeight: 'bold' }}>daily!</Text>
          </Text>
          <HeaderImage style={{ width: '100%', height: 100, position: 'absolute', bottom: 0 }} />
        </View>

        {/* 3. Features Grid */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <FeatureItem
              icon={require('../assets/icons/fresh.png')}
              title="Made Fresh Daily"
            />
            <FeatureItem
              icon={require('../assets/icons/veg-non.png')}
              title="Veg, Non-Veg, Vegan, Jain"
            />
            <FeatureItem
              icon={require('../assets/icons/delivery.png')}
              title="Delivered Daily"
            />
          </View>
          <View style={styles.featureRow}>
            <FeatureItem
              icon={require('../assets/icons/zero-plastic.png')}
              title="Zero Plastic"
            />
            <FeatureItem
              icon={require('../assets/icons/ayurveda.png')}
              title="Ayurveda"
            />
            <FeatureItem
              icon={require('../assets/icons/cal.png')}
              title="Track Fitness Goals"
            />
          </View>
        </View>

        {/* 4. Banner Section */}
        <View style={styles.banner}>
          <Image
            source={require('../assets/banners/chana.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Video
              source={require('../assets/banners/banner.mp4')} // Replace with your video URL or local file path
              style={{height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
              controls={false} // Shows controls (play, pause, volume, etc.)
              resizeMode="cover" // Adjust the video's size within the container
              repeat={true} // Repeat the video
              muted={true} // Mute the video
              paused={false} // Pause the video
              volume={1} // Set the volume (0-1)
              rate={1} // Set the playback rate
              ignoreSilentSwitch="obey" // Ignore the system's silent switch
              playWhenInactive={false} // Play the video when the app is inactive
              playInBackground={false} // Play the video in the background
            />
            <Text style={styles.bannerText}>
              ALL <Text style={styles.highlight}>YOUR HEALTH</Text>
              {'\n'}
              IN ONE <Text style={styles.highlight}>PLACE</Text>
            </Text>
          </View>
        </View>

        {/* 5. CTA Button */}
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              ['#5FBC9B', '#1E9E64']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.button]}

          >
            <Text style={styles.buttonText}>TRY IT TODAY</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AboutScreen;

interface FeatureItemProps {
  icon: any;
  title: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title }) => (
  <View style={styles.featureItem}>
    <Image source={icon} style={styles.featureIcon} resizeMode="contain" />
    <Text style={styles.featureText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  greenSection: {
    backgroundColor: '#2e7b59ff',
    padding: 20,
    alignItems: 'center',
  },
  greenText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    padding: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  featureIcon: {
    marginBottom: 8,
    height: 64,
    width: 64,
  },
  featureText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
  },
  banner: {
    position: 'relative',
    marginBottom: 16,
    // marginHorizontal: 20,
  },
  bannerImage: {
    width: '100%',
    height: 195,
    // borderRadius: 10,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
  },
  bannerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  highlight: {
    fontWeight: 'bold',
  },
  button: {
    marginHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#006400',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
