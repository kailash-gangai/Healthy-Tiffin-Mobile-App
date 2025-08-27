import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { FontAwesome5 } from "@react-native-vector-icons/fontawesome5";
import { Fontisto } from '@react-native-vector-icons/fontisto';

type Props = {
    label: string;
    icon: React.ComponentProps<typeof Fontisto>['name'];
    secure?: boolean;
} & Omit<TextInputProps, 'style' | 'placeholderTextColor'>;

import { COLORS } from '../ui/theme';

const FormInput: React.FC<Props> = ({ label, icon, secure, ...inputProps }) => {
    const [show, setShow] = useState(false);
    const isPassword = !!secure;

    return (
        <View style={styles.block}>
            {/* Label with right-extending thin line (your screenshot style) */}
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>

            </View>

            {/* Field */}
            <View style={styles.inputRow}>
                <Fontisto name={icon} size={20} color={COLORS.green} style={styles.leftIcon} />
                <TextInput
                    {...inputProps}
                    placeholderTextColor={COLORS.placeholder}
                    secureTextEntry={isPassword && !show}
                    style={styles.input}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShow((s) => !s)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <FontAwesome5 name={show ? 'eye' : 'eye-slash'} size={20} color={COLORS.green} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    block: { width: '100%' },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 0,
        display: 'flex',
    },
    label: {
        color: COLORS.label,
        fontSize: 14,
        fontWeight: '700',
        backgroundColor: COLORS.white,
        display: "flex",
        padding: 4,
        position: 'relative',
        top: 20,
        left: 16,
        zIndex: 1
    },
    labelLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.line,
        marginLeft: 8,

    },
    inputRow: {
        height: 54,
        borderWidth: 1,
        borderColor: COLORS.fieldBorder,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        marginBottom: 0,
    },
    leftIcon: { marginRight: 10 },
    input: {
        flex: 1,
        fontSize: 15.5,
        color: COLORS.black,
        paddingVertical: 10,
    },
});

export default FormInput;
