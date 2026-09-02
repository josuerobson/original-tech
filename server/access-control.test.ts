import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function ctxFor(role: "user" | "admin"): TrpcContext {
  return { user: { id: 7, openId: "access-test", email: "client@example.com", name: "Client", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("access control", () => {
  it("blocks regular users from administrative client listing", async () => {
    const caller = appRouter.createCaller(ctxFor("user"));
    await expect(caller.admin.clients()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows the admin procedure to pass role validation", async () => {
    const caller = appRouter.createCaller(ctxFor("admin"));
    // With no database connection in the isolated test environment, the procedure returns an empty collection.
    await expect(caller.admin.clients()).resolves.toEqual([]);
  });
});
