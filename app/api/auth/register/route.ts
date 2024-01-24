import db from "@/backend/config/db";
import { registerUser } from "@/backend/controllers/userController";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>()

db()

router.post(registerUser)

export async function POST(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx)
}