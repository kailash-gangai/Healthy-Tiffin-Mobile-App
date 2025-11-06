import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { getAllMetaobjects, getMetaObjectByHandle } from '../shopify/queries/getMetaObject';
import { SPACING } from '../ui/theme';

type TagListFilterProps = {
    onChange: (selectedTags: string[]) => void;
    selectedTags: string[];
};

const TagListFilter: React.FC<TagListFilterProps> = ({ onChange, selectedTags }) => {
    const [tags, setTags] = useState<string[]>([]); // State to store tags from API
    const [loading, setLoading] = useState<boolean>(false); // Loading state for fetching tags


    useEffect(() => {
        const fetchTags = async () => {
            setLoading(true); // Start loading
            try {
                const data = await getMetaObjectByHandle("gid://shopify/Metaobject/150017081586");
                if (data && data.length > 0) {
                    setTags(JSON.parse(data[0]?.value));
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, []);
    const handleTagPress = (tag: string) => {
        const updatedSelectedTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];

        onChange(updatedSelectedTags);
    };

    const handleClearTags = () => {
        onChange([]);
    };

    const getTagStyle = (tag: string) => {
        switch (tag.toUpperCase()) {
            case 'VEG':
                return styles.vegTag;
            case 'VGN':
                return styles.vgnTag;
            case 'NV':
                return styles.nvTag;
            case 'FOODMAP':
                return styles.fodmapTag;
            case 'PLATE METHOD':
                return styles.plateMethodTag;
            default:
                return styles.defaultTag;
        }
    };

    return (
        <View style={styles.container}>

            <View style={styles.tagsContainer}>
                {tags.map(tag => {
                    const isSelected = selectedTags.includes(tag);

                    return (
                        <TouchableOpacity
                            key={tag}
                            onPress={() => handleTagPress(tag)}
                            style={[styles.tag, getTagStyle(tag), isSelected && styles.selectedTag]}>
                            <Text style={[styles.tagText, isSelected && styles.selectedText]}>
                                {tag.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
                {/* {selectedTags.length > 0 && (
                    <Button title="Clear" onPress={handleClearTags} color="#FF4D4D" />
                )} */}
            </View>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SPACING,
        paddingTop: 16,
        alignItems: 'flex-start',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tag: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 22,
        borderWidth:0.5,
        borderColor: '#E9E8E9',    
    },
    vegTag: {
        backgroundColor: '#A6CE39', // Green color for VEG
    },
    vgnTag: {
        backgroundColor: '#F2B740', // Orange color for VGN
    },
    nvTag: {
        backgroundColor: '#6A3A1D', // Brown color for NV
    },
    fodmapTag: {
        backgroundColor: '#A5B6A5', // Light Green color for FODMAP
    },
    plateMethodTag: {
        backgroundColor: '#F6A868', // Light Orange color for PLATE METHOD
    },
    selectedTag: {
        opacity: 1, // Full opacity when selected
        backgroundColor: '#d6f2e6', // Change background to black when selected
    },
    tagText: {
        fontSize: 12,
        fontWeight: '300',
        letterSpacing:-0.24,
        color: '#ffffff', // Default text color
    },
    selectedText: {
        color: '#127e51', // White text when selected
    },
    defaultTag: {
        backgroundColor: '#0B5733', // Default light background for tags
    },
});

export default TagListFilter;
