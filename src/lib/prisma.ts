import { PrismaClient, Prisma } from "@prisma/client";

type ActionType = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGIN_FAILED" | "LOGOUT" | "EXPORT";
import { auditStore } from "@/lib/audit-context";

// ─── Models that generate audit log entries on mutation ───────────────────────
// Add any future model name here to opt it in automatically. The Prisma
// extension intercepts $allModels, but only persists a log for listed models.
const AUDITED_MODELS = new Set(["Temple", "Province", "King", "Style", "Era"]);

// ─── Prisma Client Extension ──────────────────────────────────────────────────
// Intercepts create / update / delete on every audited model.
// Uses a separate *base* client for the pre-fetch and audit write so
// there is zero risk of recursive interception.
function buildExtension(base: PrismaClient) {
  return {
    query: {
      $allModels: {
        async $allOperations<T, A>({
          operation,
          model,
          args,
          query,
        }: {
          operation: string;
          model: string;
          args: A;
          query: (args: A) => Promise<T>;
        }): Promise<T> {
          // Pass through non-audited models and read operations immediately
          if (!AUDITED_MODELS.has(model) || !["create", "update", "delete"].includes(operation)) {
            return query(args);
          }

          // Derive the camelCase accessor key: "Temple" → "temple"
          const modelKey = (model.charAt(0).toLowerCase() + model.slice(1)) as keyof PrismaClient;
          const whereClause = (args as Record<string, unknown>).where;

          // ── Pre-fetch old record for UPDATE / DELETE ───────────────────────
          let oldValues: Record<string, unknown> | null = null;
          if ((operation === "update" || operation === "delete") && whereClause) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const record = await (base[modelKey] as any).findFirst({ where: whereClause });
              if (record) oldValues = JSON.parse(JSON.stringify(record)) as Record<string, unknown>;
            } catch {
              // Non-fatal: proceed without old values
            }
          }

          // ── Execute the actual Prisma operation ───────────────────────────
          const result = await query(args);

          // ── Derive audit fields from result ───────────────────────────────
          const resultRecord = result as Record<string, unknown>;
          const entityId = String(
            resultRecord?.id ?? oldValues?.id ?? ""
          );
          const newValues =
            operation !== "delete" && result
              ? (JSON.parse(JSON.stringify(result)) as Record<string, unknown>)
              : null;

          const actionMap: Record<string, ActionType> = {
            create: "CREATE",
            update: "UPDATE",
            delete: "DELETE",
          };

          // ── Read actor from AsyncLocalStorage ─────────────────────────────
          const ctx = auditStore.getStore();

          // Fire-and-forget: never let audit logging break the main request
          base.auditLog
            .create({
              data: {
                action: actionMap[operation],
                entityType: model,
                entityId,
                actorId: ctx?.actorId ?? null,
                actorEmail: ctx?.actorEmail ?? null,
                ipAddress: ctx?.ipAddress ?? null,
                userAgent: ctx?.userAgent ?? null,
                oldValues: oldValues != null ? (oldValues as Prisma.InputJsonValue) : undefined,
                newValues: newValues != null ? (newValues as Prisma.InputJsonValue) : undefined,
              },
            })
            .catch((err: unknown) => console.error("[audit-extension]", err));

          return result;
        },
      },
    },
  };
}

// ─── Client factory (one instance per process) ────────────────────────────────
function createClients() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
  const extended = base.$extends(buildExtension(base));
  return { base, extended };
}

type Clients = ReturnType<typeof createClients>;

const globalForPrisma = globalThis as unknown as {
  prismaClients: Clients | undefined;
};

const clients: Clients =
  globalForPrisma.prismaClients ?? createClients();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaClients = clients;

/** The extended Prisma client — use this everywhere in the application. */
export const prisma = clients.extended;

/** Direct base client — only for explicit audit log writes (e.g. LOGIN). */
const basePrisma = clients.base;

// ─── Manual audit helper (auth events & exports) ──────────────────────────────
interface ManualAuditInput {
  action: ActionType;
  entityType?: string;
  entityId?: string;
  actorId?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

/**
 * Write an audit log entry for actions that are NOT Prisma model mutations
 * (e.g. LOGIN, LOGOUT, LOGIN_FAILED, EXPORT).
 * Fire-and-forget — never throws.
 */
export function logAuditEvent(data: ManualAuditInput): void {
  void basePrisma.auditLog
    .create({
      data: {
        action: data.action,
        entityType: data.entityType ?? null,
        entityId: data.entityId ?? null,
        actorId: data.actorId ?? null,
        actorEmail: data.actorEmail ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        oldValues: data.oldValues != null ? (data.oldValues as Prisma.InputJsonValue) : undefined,
        newValues: data.newValues != null ? (data.newValues as Prisma.InputJsonValue) : undefined,
      },
    })
    .catch((err: unknown) => console.error("[audit-event]", err));
}

