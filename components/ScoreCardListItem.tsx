import { Text, View } from "react-native";
import Card from "./ui/Card";

type Props = {
    onPress?: () => void;
    poseName: string;
    side: "LEFT" | "RIGHT" | "NA";
    overallScore: number | null; // retrieved from server
}

export default function ScoreCardListItem({ onPress, poseName, overallScore, side }: Props) {
    return (
        <Card style={{ gap: 6 }} onPress={onPress}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    {poseName}
                </Text>
                {/* If there is a side, then show it */}
                {side !== "NA" && (
                    <Text style={{ color: '#c7cad1', fontSize: 14 }}>
                        {side === "LEFT" ? "Left Side" : "Right Side"}
                    </Text>
                )}
            </View>
            <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    {overallScore}
                </Text>
            </View>
        </Card>
    );
}