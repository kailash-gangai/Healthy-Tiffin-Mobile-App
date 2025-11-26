import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import EyeHide from '../assets/htf-icon/icon-eye-hide.svg';
import EyeShow from '../assets/htf-icon/icon-eye.svg';
type Props = {
    label: string;
    icon: any;
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
                <Text style={styles.label}>{label }</Text>
            </View>

            {/* Field */}
            <View style={styles.inputRow}>
                <View style={styles.leftIcon}>{icon}</View>
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
                        {show ? <EyeShow width={24} height={24} /> : <EyeHide width={24} height={24} />}

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
        position: 'relative',
        zIndex: 1,
    },
    label: {
        color: COLORS.label,
        fontSize: 14,
        fontWeight: '700',
        backgroundColor: COLORS.white,
        display: "flex",
        padding: 4,
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
