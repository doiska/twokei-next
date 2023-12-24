import { Cron } from "croner";
import { kil } from "@/db/Kil";
import { coreScheduler } from "@/db/schemas/core-scheduler";
import { logger } from "@/lib/logger";

const cronLogger = logger.child({ module: "cron" });

export async function startCronJobs() {
  Cron(
    "*/5 * * * * *",
    {
      name: "refresh-cron-jobs",
    },
    async () => {
      const activeJobs = Cron.scheduledJobs.map((job) => job.name);

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

        const keepAlive =
          activeJobs.includes(service.service) && service.enabled;

        if (keepAlive) {
          continue;
        }

        if (!keepAlive && current) {
          current.stop();
          logger.info(`Stopped cron job ${service.service}.`);
          continue;
        }

        await import(`./jobs/${service.service}.ts`)
          .then((m) => {
            cronLogger.info(`Loaded cron job ${service.service}.`);
            Cron(
              service.schedule,
              {
                name: service.service,
              },
              m.default,
            );
          })
          .catch((err) => {
            cronLogger.error(`Failed to load cron job ${service.service}.`);
            cronLogger.error(err);
          });
      }
    },
  );
}
