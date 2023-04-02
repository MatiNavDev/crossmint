import dotenv from "dotenv";
import { AbstralCrosser } from "./crosser";
dotenv.config();

async function doCrossPolyanet() {
  const CrosserInstance = new AbstralCrosser(process.env.CANDIDATE_ID);
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
