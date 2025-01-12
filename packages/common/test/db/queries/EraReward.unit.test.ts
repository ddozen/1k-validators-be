import { EraRewardModel } from "../../../src/db/models";
import {
  getEraReward,
  getLastEraRewards,
  setEraReward,
} from "../../../src/db/queries";
import { initTestServerBeforeAll } from "../../testUtils/dbUtils";

initTestServerBeforeAll();

beforeEach(async () => {
  await EraRewardModel.deleteMany({});
});

describe("setEraReward", () => {
  it("should create a new era reward record if it doesn't exist", async () => {
    const era = 1;
    const stash = "test_stash";
    const rewardDestination = "test_destination";
    const validatorStash = "test_validator_stash";
    const amount = 100;
    const blockTimestamp = 1234567890;
    const blockNumber = 1000;
    const slashKTon = 0;
    const claimTimestampDelta = 0;
    const claimBlockDelta = 0;

    await setEraReward(
      era,
      stash,
      rewardDestination,
      validatorStash,
      amount,
      blockTimestamp,
      blockNumber,
      slashKTon,
      claimTimestampDelta,
      claimBlockDelta,
    );

    const result = await EraRewardModel.findOne({ era, stash });
    expect(result).toBeDefined();
    expect(result?.stash).toBe(stash);
    expect(result?.blockTimestamp).toBe(blockTimestamp);
  });
});

describe("getLastEraRewards", () => {
  it("should retrieve the last era reward records for a stash", async () => {
    for (let i = 0; i < 10; i++) {
      const era = i;
      const stash = "test_stash";
      const rewardDestination = "test_destination";
      const validatorStash = "test_validator_stash";
      const amount = 100;
      const blockTimestamp = 1234567890;
      const blockNumber = 1000;
      const slashKTon = 0;
      const claimTimestampDelta = 0;
      const claimBlockDelta = 0;

      await setEraReward(
        era,
        stash,
        rewardDestination,
        validatorStash,
        amount,
        blockTimestamp,
        blockNumber,
        slashKTon,
        claimTimestampDelta,
        claimBlockDelta,
      );
    }

    const result = await getLastEraRewards("test_stash", 6);
    expect(result).toHaveLength(6);
  });
});

describe("getEraReward", () => {
  it("should retrieve the era reward record for a specific era and stash", async () => {
    const era = 1;
    const stash = "test_stash";
    const rewardDestination = "test_destination";
    const validatorStash = "test_validator_stash";
    const amount = 100;
    const blockTimestamp = 1234567890;
    const blockNumber = 1000;
    const slashKTon = 0;
    const claimTimestampDelta = 0;
    const claimBlockDelta = 0;

    await setEraReward(
      era,
      stash,
      rewardDestination,
      validatorStash,
      amount,
      blockTimestamp,
      blockNumber,
      slashKTon,
      claimTimestampDelta,
      claimBlockDelta,
    );

    const result = await getEraReward(stash, era);
    expect(result).toBeDefined();
    expect(result?.rewardDestination).toBe(rewardDestination);
  });
});
