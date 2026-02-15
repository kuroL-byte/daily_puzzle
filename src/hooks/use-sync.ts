"use client";

import { useEffect } from "react";
import { getUnsyncedActivity, markAsSynced } from "@/lib/storage";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useSync() {
    const sync = async (userId: string) => {
        try {
            const unsynced = await getUnsyncedActivity();
            if (unsynced.length === 0) return;

            const response = await fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, entries: unsynced }),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    await markAsSynced(unsynced.map((u) => u.date));
                    console.log(`Successfully synced ${result.synced} items.`);
                }
            }
        } catch (error) {
            console.error("Sync error:", error);
        }
    };

    useEffect(() => {
        // 1. Sync on login/auth change
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) sync(user.uid);
        });

        // 2. Sync on app load (if already logged in)
        if (auth.currentUser) sync(auth.currentUser.uid);

        // 3. Sync on window.online
        const handleOnline = () => {
            if (auth.currentUser) sync(auth.currentUser.uid);
        };

        window.addEventListener("online", handleOnline);

        return () => {
            unsubscribe();
            window.removeEventListener("online", handleOnline);
        };
    }, []);
}
