type PosePreviewDTO = {
    sanskritName: string;
    sequenceGroup: "SUN_SALUTATIONS" | "STANDING" | "PRIMARY" | "INTERMEDIATE" | "ADVANCED_A" | "ADVANCED_B" | "FINISHING";
}

export type ScoreCardListItemDTO = {
    id: string;
    side: "LEFT" | "RIGHT" | "NA";
    overallScore: number | null;
    pose: PosePreviewDTO;
    isComplete: boolean;
}