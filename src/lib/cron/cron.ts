import { Cron } from "croner";
import { kil } from "@/db/Kil";
import { coreScheduler } from "@/db/schemas/core-scheduler";
import { logger } from "@/lib/logger";
import { eq, sql } from "drizzle-orm";

const cronLogger = logger.child({ module: "cron" });

export async function startCronJobs() {
  Cron(
    "*/5 * * * *",
    {
      name: "refresh-cron-jobs",
    },
    async () => {
      const services = await kil
        .select({
          service: coreScheduler.service,
          enabled: coreScheduler.enabled,
          schedule: coreScheduler.schedule,
        })
        .from(coreScheduler);

      for (const service of services) {
        const current = Cron.scheduledJobs.find(
          (job) => job.name === service.service,
        );

        if (!current && !service.enabled) {
          continue;
        }

        if (current) {
          if (!service.enabled) {
            current.stop();
            continue;
          }

          if (current.getPattern() === service.schedule) {
            continue;
          }

          current.stop();
        }

        try {
          const { execute: jobFn } = await import(
            `./jobs/${service.service}.ts`
          );

          const newCron = Cron(
            service.schedule,
            {
              name: service.service,
            },
            async () => {
              await jobFn();

              await kil
                .update(coreScheduler)
                .set({
                  updatedAt: sql`NOW()`,
                })
                .where(eq(coreScheduler.service, service.service));
            },
          );
          logger.info(`Started cron job ${service.service}.`);

          await newCron.trigger();
        } catch (err) {
          cronLogger.error(`Failed to load cron job ${service.service}.`);
          cronLogger.error(err);
        }
      }
    },
  );
}
