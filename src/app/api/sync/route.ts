import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { userId, entries } = await req.json();

        if (!userId || !Array.isArray(entries)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Requirement: Use prisma.dailyScore.upsert
        // Guarantees: No duplicates, safe retries, horizontal scalability
        const operations = entries.map((entry: any) => {
            return prisma.dailyScore.upsert({
                where: {
                    userId_date: {
                        userId: userId,
                        date: entry.date,
                    },
                },
                update: {
                    score: entry.score,
                    timeTaken: entry.timeTaken,
                    completed: true,
                },
                create: {
                    userId: userId,
                    date: entry.date,
                    score: entry.score,
                    timeTaken: entry.timeTaken,
                    completed: true,
                },
            });
        });

        await prisma.$transaction(operations);

        return NextResponse.json({ success: true, synced: entries.length });
    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
