import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import NoteIcon from  '../assets/newicon/note-icon.svg'
type OrderNoteProps = {
  collapsed: boolean;
  toggleCollapse: () => void;
  note: string;
  onChangeNote: (text: string) => void;
};

const OrderNote = ({ collapsed, toggleCollapse, note, onChangeNote }: OrderNoteProps) => {
  return (
    <View style={styles.orderNoteContainer}>
      <TouchableOpacity onPress={toggleCollapse} style={styles.header}>
        <Text style={styles.headerText}>Add Order Note</Text>
        <NoteIcon width={20} height={20} />
      </TouchableOpacity>

      {!collapsed && (
        <View style={styles.textAreaContainer}>
          <TextInput
            value={note}
            onChangeText={onChangeNote}
            placeholder="Note"
            multiline
            style={styles.textArea}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  orderNoteContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
   
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  textAreaContainer: {
    marginTop: 10,
  },
  textArea: {
    height: 70,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
  },
});

export default OrderNote;
