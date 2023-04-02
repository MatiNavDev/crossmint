import dotenv from 'dotenv';
import { AbstralCrosser } from './crosser';
dotenv.config();

async function doCrossPolyanet() {
  const CrosserInstance = new AbstralCrosser(process.env.CANDIDATE_ID);
  await CrosserInstance.initCrossGoal();
  await CrosserInstance.doCross();
}
doCrossPolyanet()
  .then(() => {
    console.log('Done!');
  })
  .catch((error) => console.error(error));
