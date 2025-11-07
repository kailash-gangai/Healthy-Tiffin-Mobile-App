import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { Text, View } from 'react-native';

const EmptyState = ({
  currentDay,
  message,
}: {
  currentDay: string;
  message: string;
}) => {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 12,
        padding: 20,
        borderRadius: 12,
        backgroundColor: '#FFF9F5',
        borderWidth: 1,
        borderColor: '#FFE8D6',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <FontAwesome5 name="calendar-times" size={22} color="#E67C24" />
        <Text
          style={{
            marginLeft: 10,
            fontSize: 17,
            fontWeight: '800',
            color: '#8A4A0F',
            letterSpacing: -0.3,
          }}
        >
          {currentDay} Menu
        </Text>
      </View>
      <Text
        style={{
          fontSize: 14,
          color: '#D35400',
          lineHeight: 20,
          fontWeight: '500',
          letterSpacing: -0.2,
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default EmptyState;
