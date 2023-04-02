import dotenv from "dotenv";
import { Cross, CrosserFactory, CrossType } from "./crosser";
dotenv.config();

async function doCrossPolyanet() {
  const polyanets: Cross = {
    type: CrossType.POLYANET,
    candidateId: process.env.CANDIDATE_ID,
  };

  const CrosserInstance = new CrosserFactory(polyanets);
  await CrosserInstance.initCrossGoal();
  await CrosserInstance.doCross();
}
console.time("doCrossPolyanet");
doCrossPolyanet()
  .then(() => {
    console.timeEnd("doCrossPolyanet");
    console.log("Done!");
  })
  .catch((error) => console.error(error));
