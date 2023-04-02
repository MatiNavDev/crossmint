import dotenv from 'dotenv';
import { AstralCrosser } from './crosser';
dotenv.config();

async function doCrossPolyanet() {
  const CrosserInstance = new AstralCrosser(process.env.CANDIDATE_ID);
  await CrosserInstance.initCrossGoal();
  await CrosserInstance.doCross();
}
doCrossPolyanet()
  .then(() => {
    console.log('Done!');
  })
  .catch((error) => console.error(error));
