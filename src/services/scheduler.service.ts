import schedule from "node-schedule";
import { LoggerFactory } from "../logger.factory";

export interface ScheduleJob {
  execute(): Promise<void> | void;
}

const logger = LoggerFactory.getLogger("Scheduler");

export class SchedulerService {
  static schedule(jobName: string, rule: string, job: ScheduleJob) {
    const scheduledJob = schedule.scheduleJob(jobName, rule, async () => {
      try {
        logger.debug(
          { nextInvocation: scheduledJob.nextInvocation() },
          "Executing job %s",
          jobName
        );
        await job.execute();
      } catch (err) {
        logger.error(err, "Job %s caused unexpected error", jobName);
      }
    });
    logger.info(
      { nextInvocation: scheduledJob.nextInvocation() },
      "Scheduled job %s",
      jobName
    );
  }
}
