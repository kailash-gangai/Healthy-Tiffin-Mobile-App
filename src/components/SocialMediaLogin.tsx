// components/SocialAuthButtons.tsx
import React from 'react';
import {
      View,
      TouchableOpacity,
      StyleSheet,
      GestureResponderEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import Facebook from '../assets/htf-icon/fb.svg';
import Insta from '../assets/htf-icon/insta.svg';
import Google from '../assets/htf-icon/google.svg';
import Apple from '../assets/htf-icon/apple.svg';

const SocialAuthButtons = ({
      onFacebook,
      onInstagram,
      onGoogle,
      onApple,
}: {
      onFacebook?: (e: GestureResponderEvent) => void;
      onInstagram?: (e: GestureResponderEvent) => void;
      onGoogle?: (e: GestureResponderEvent) => void;
      onApple?: (e: GestureResponderEvent) => void;
}) => {
      return (
            <View style={styles.row}>

                  {/* Facebook */}
                  <Circle
                        bg="#1877F2"
                        onPress={onFacebook}
                        children={<Facebook width={30} height={30} />}
                  />

                  {/* Instagram */}
                  <TouchableOpacity activeOpacity={0.85} onPress={onInstagram}>
                        <LinearGradient
                              colors={[
                                    '#405DE6',
                                    '#5851DB',
                                    '#833AB4',
                                    '#C13584',
                                    '#E1306C',
                                    '#FD1D1D',
                                    '#F56040',
                                    '#FCAF45',
                                    '#FFDC80',
                              ]}
                              style={styles.circle}
                        >
                              <Insta height={30} width={30} />
                        </LinearGradient>
                  </TouchableOpacity>

                  {/* Google */}
                  <Circle
                        bg="#EA4335"
                        onPress={onGoogle}
                        children={<Google width={30} height={40} />}
                  />

                  {/* Apple */}
                  <Circle
                        bg="#000"
                        onPress={onApple}
                        children={<Apple width={30} height={30} />}
                  />

            </View>
      );
};

const Circle = ({
      children,
      bg,
      onPress,
}: {
      children: React.ReactNode;
      bg: string;
      onPress?: (e: GestureResponderEvent) => void;
}) => (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
            <View style={[styles.circle, { backgroundColor: bg }]}>{children}</View>
      </TouchableOpacity>
);

const styles = StyleSheet.create({
      row: {
            marginTop: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
      },
      circle: {
            width: 60,
            height: 60,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
      },
});

export default SocialAuthButtons;
