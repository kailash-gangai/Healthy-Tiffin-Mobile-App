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
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#F4FBF6',
        borderWidth: 1,
        borderColor: '#D8F0DF',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <FontAwesome5 name="calendar-times" size={20} color="#2E7D32" />
        <Text
          style={{
            marginLeft: 8,
            fontSize: 16,
            fontWeight: '700',
            color: '#1B5E20',
          }}
        >
          No menu for {currentDay}
        </Text>
      </View>
      <Text style={{ fontSize: 13, color: '#2E7D32', lineHeight: 18 }}>
        {message}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 10,
        }}
      >
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
          <View
            key={d}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#B7E1C0',
              backgroundColor: '#FFFFFF',
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#2E7D32',
              }}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
export default EmptyState;
