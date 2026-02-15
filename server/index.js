const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Sync daily scores
app.post('/sync/daily-scores', async (req, res) => {
    try {
        const { userId, entries } = req.body; // Expecting { userId: "...", entries: [...] }

        if (!userId || !Array.isArray(entries)) {
            return res.status(400).json({ error: "Invalid payload" });
        }

        // Validate user exists (simplified for now, ideally auth middleware)
        // For MVP, if user doesn't exist, we might auto-create or error out.
        // Assuming user aggregation or simple recording for now.

        // Transaction to upsert multiple entries
        const operations = entries.map(entry => {
            return prisma.dailyScore.upsert({
                where: {
                    userId_date: {
                        userId: userId,
                        date: new Date(entry.date)
                    }
                },
                update: {
                    score: entry.score,
                    timeTaken: entry.timeTaken
                },
                create: {
                    userId: userId,
                    date: new Date(entry.date),
                    score: entry.score,
                    timeTaken: entry.timeTaken
                }
            });
        });

        await prisma.$transaction(operations);

        res.json({ success: true, synced: entries.length });
    } catch (error) {
        console.error("Sync error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
