import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@react-native-vector-icons/fontawesome5";
import { COLORS, SHADOW } from "../ui/theme";
import FavoriteDetailModal from "./FavoriteDetailModal";
type Dish = {
      id: string;
      title: string;
      im: any;              // require(...);
      price: string;
      thumb: any;              // require(...)
      description?: string;    // shown in modal
      tag?: string;           // shown in modal
};

export default function FavoriteCard({ item }: { item: Dish; onChange?: (d: Dish) => void }) {
      const [openModel, setOpenModel] = React.useState(false);
      const onToggleLike = () => {
            console.log('onToggleLike');
      };
      return (
            <>

                  <TouchableOpacity activeOpacity={0.9} onPress={() => setOpenModel(true)} style={s.card}>
                        <Image source={item.thumb} style={s.img} />
                        <View style={{ flex: 1 }}>
                              <Text style={s.title} numberOfLines={1}>{item.title}</Text>
                              <Text style={s.price}>{item.price}</Text>
                        </View>
                        <View style={s.rightCol}>
                              <TouchableOpacity onPress={onToggleLike} hitSlop={10} style={s.heart}>
                                    <FontAwesome5 name="heart" size={18} color="#fff" />
                              </TouchableOpacity>
                              <Text style={s.tag}>{item.tag}</Text>
                        </View>
                  </TouchableOpacity>

                  {/* Modal */}
                  <FavoriteDetailModal
                        visible={openModel}
                        onClose={() => setOpenModel(false)}
                        onShare={() => { }}
                        onToggleLike={() => { }}
                        liked={true}
                        item={item}
                  />
            </>
      );
}

const s = StyleSheet.create({
      card: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFF",
            borderRadius: 16,
            padding: 10,
            ...SHADOW
      },
      img: { width: 110, height: 110, borderRadius: 12, marginRight: 12, resizeMode: "cover" },
      title: { fontWeight: "600", fontSize: 20, color: "#1E1E1E" },
      price: { marginTop: 6, color: "#0B5733", fontWeight: "800", fontSize: 24 },
      rightCol: { alignItems: "flex-end", justifyContent: "space-between", height: 62 },
      tag: { color: "#F6A300", fontWeight: "800", fontSize: 12, marginTop: 6 },
      heart: {
            width: 30, height: 30, borderRadius: 15,
            alignItems: "center", justifyContent: "center",
            backgroundColor: "#F6A300",
      },
});
