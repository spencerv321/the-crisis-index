import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUBSCRIBERS_PATH = path.join(process.cwd(), "data", "subscribers.json");

interface Subscriber {
  email: string;
  subscribedAt: string;
}

async function readSubscribers(): Promise<Subscriber[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSubscribers(subscribers: Subscriber[]): Promise<void> {
  await fs.writeFile(SUBSCRIBERS_PATH, JSON.stringify(subscribers, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const subscribers = await readSubscribers();

    if (subscribers.some((s) => s.email === normalizedEmail)) {
      return NextResponse.json({ message: "Already subscribed" });
    }

    subscribers.push({
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
    });

    await writeSubscribers(subscribers);

    console.log(`[Subscribe] ${normalizedEmail} (total: ${subscribers.length})`);

    return NextResponse.json({ message: "Subscribed" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
