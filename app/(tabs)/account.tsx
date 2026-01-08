import { deleteAccount } from "@/lib/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/AuthProvider";

export default function Account() {
    const { signOut } = useAuth();
    const router = useRouter();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [pw, setPw] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const confirmDelete = () => {
        Alert.alert(
            "Delete account?",
            "WARNING: This action is permanent and you will lose your account data.",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, delete",
                    style: "destructive",
                    onPress: () => {
                        setErr(null);
                        setPw("");
                        setDeleteOpen(true);
                    },
                },
            ]
        );
    };

    const runDelete = async () => {
        try {
            setBusy(true);
            setErr(null);

            if (!pw.trim()) {
                setErr("Please enter your password.");
                return;
            }

            await deleteAccount(pw);

            setSuccess("Account deleted.");
            setDeleteOpen(false);

            // kill token + navigate to login
            await signOut();
            router.replace("/(auth)/login");
        } catch (e: any) {
            setErr(e?.message || "Delete failed.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, padding: 20, gap: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: "700" }}>Account</Text>

                {success ? <Text style={{ color: "green" }}>{success}</Text> : null}

                <Pressable
                    onPress={async () => {
                        await signOut();
                        router.replace("/(auth)/login");
                    }}
                    style={{ backgroundColor: "#111", padding: 14, borderRadius: 10 }}
                >
                    <Text style={{ color: "#fff", textAlign: "center" }}>Sign out</Text>
                </Pressable>

                <Pressable
                    onPress={confirmDelete}
                    style={{
                        marginTop: 10,
                        backgroundColor: "#2a0f0f",
                        borderWidth: 1,
                        borderColor: "#ff4d4d",
                        padding: 14,
                        borderRadius: 10,
                    }}
                >
                    <Text style={{ color: "#ff4d4d", textAlign: "center", fontWeight: "700" }}>
                        Delete account
                    </Text>
                </Pressable>

                <Modal
                    visible={deleteOpen}
                    transparent
                    animationType="fade"
                    onRequestClose={() => (busy ? null : setDeleteOpen(false))}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            justifyContent: "center",
                            padding: 18,
                        }}
                    >
                        <View style={{ backgroundColor: "white", borderRadius: 14, padding: 16, gap: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: "800" }}>Confirm deletion</Text>
                            <Text style={{ opacity: 0.75 }}>
                                Enter your password to permanently delete your account.
                            </Text>

                            {err ? <Text style={{ color: "tomato" }}>{err}</Text> : null}

                            <TextInput
                                value={pw}
                                onChangeText={setPw}
                                placeholder="Password"
                                secureTextEntry
                                editable={!busy}
                                style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
                            />

                            <View style={{ flexDirection: "row", gap: 10, justifyContent: "flex-end" }}>
                                <Pressable
                                    disabled={busy}
                                    onPress={() => setDeleteOpen(false)}
                                    style={{ paddingVertical: 10, paddingHorizontal: 12, opacity: busy ? 0.5 : 1 }}
                                >
                                    <Text style={{ fontWeight: "700" }}>Cancel</Text>
                                </Pressable>

                                <Pressable
                                    disabled={busy}
                                    onPress={runDelete}
                                    style={{
                                        paddingVertical: 10,
                                        paddingHorizontal: 12,
                                        backgroundColor: "#ff4d4d",
                                        borderRadius: 10,
                                        opacity: busy ? 0.6 : 1,
                                    }}
                                >
                                    {busy ? (
                                        <ActivityIndicator />
                                    ) : (
                                        <Text style={{ color: "white", fontWeight: "800" }}>Delete</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}
