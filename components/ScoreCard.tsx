import React from 'react';
import { Text, View } from 'react-native';

type Props = {
    poseName: string;
    side: "LEFT" | "RIGHT" | "NA";
    
}

export const ScoreCard = () => {
    return (
        <View>
            <Text>ScoreCard</Text>
        </View>
    )
}
