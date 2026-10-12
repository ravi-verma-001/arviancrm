import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exec } from "child_process";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
  }

  try {
    const seedScriptPath = path.join(process.cwd(), "prisma", "seed.js");
    const { stdout, stderr } = await execPromise(`node "${seedScriptPath}"`);

    return NextResponse.json({
      success: true,
      message: "Demo dataset reset and re-seeded successfully",
      output: stdout,
    });
  } catch (error: unknown) {
    console.error("Demo data reset error:", error);
    return NextResponse.json({ error: "Failed to reset demo data" }, { status: 500 });
  }
}
