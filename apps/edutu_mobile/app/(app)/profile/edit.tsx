import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from "../../../components/ui/ScreenHeader";

export default function EditProfileScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScreenHeader title="Edit Profile" showBack />
            <View className="flex-1 items-center justify-center p-5">
                <Text className="text-text-secondary text-center">
                    Edit profile form coming soon (Ported from web EditProfileScreen.tsx)
                </Text>
            </View>
        </SafeAreaView>
    );
}
