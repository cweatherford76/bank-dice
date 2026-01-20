import { describe, it, expect } from "vitest";
import {
  getRollResultType,
  calculateRollResult,
  calculateStartingBank,
  canPlayerBank,
  calculateBankPoints,
  generateJoinCode,
  isValidJoinCode,
  getCurrentTurnPosition,
  isInSafeZone,
  allPlayersBanked,
} from "./game-engine";
import { DEFAULT_GAME_OPTIONS, GameOptions } from "@/types/game";

describe("getRollResultType", () => {
  const defaultSafeZone = 3;

  it("returns 'seven' for 7 in safe zone (rolls 1-3)", () => {
    expect(getRollResultType(3, 4, 1, defaultSafeZone)).toBe("seven");
    expect(getRollResultType(2, 5, 2, defaultSafeZone)).toBe("seven");
    expect(getRollResultType(1, 6, 3, defaultSafeZone)).toBe("seven");
  });

  it("returns 'bust' for 7 in danger zone (rolls 4+)", () => {
    expect(getRollResultType(3, 4, 4, defaultSafeZone)).toBe("bust");
    expect(getRollResultType(2, 5, 5, defaultSafeZone)).toBe("bust");
    expect(getRollResultType(1, 6, 10, defaultSafeZone)).toBe("bust");
  });

  it("returns 'double' for doubles", () => {
    expect(getRollResultType(2, 2, 1, defaultSafeZone)).toBe("double");
    expect(getRollResultType(6, 6, 5, defaultSafeZone)).toBe("double");
  });

  it("returns 'normal' for regular rolls", () => {
    expect(getRollResultType(2, 3, 1, defaultSafeZone)).toBe("normal");
    expect(getRollResultType(4, 5, 5, defaultSafeZone)).toBe("normal");
  });

  it("respects custom safe zone size", () => {
    // With 5 safe zone rolls, roll 5 should still be safe
    expect(getRollResultType(3, 4, 5, 5)).toBe("seven");
    // Roll 6 should be danger zone
    expect(getRollResultType(3, 4, 6, 5)).toBe("bust");
  });
});

describe("calculateRollResult", () => {
  const options = DEFAULT_GAME_OPTIONS;

  describe("Safe Zone (rolls 1-3)", () => {
    it("adds +70 for rolling a 7", () => {
      const result = calculateRollResult(3, 4, 1, 0, 0, options);
      expect(result.newBankTotal).toBe(70);
      expect(result.isBust).toBe(false);
      expect(result.resultType).toBe("seven");
    });

    it("adds face value for doubles (no multiplier)", () => {
      const result = calculateRollResult(4, 4, 2, 100, 0, options);
      expect(result.newBankTotal).toBe(108); // 100 + 8
      expect(result.isBust).toBe(false);
    });

    it("adds face value for normal rolls", () => {
      const result = calculateRollResult(2, 4, 1, 50, 0, options);
      expect(result.newBankTotal).toBe(56); // 50 + 6
      expect(result.isBust).toBe(false);
    });
  });

  describe("Danger Zone (rolls 4+)", () => {
    it("busts on rolling a 7", () => {
      const result = calculateRollResult(3, 4, 4, 500, 0, options);
      expect(result.newBankTotal).toBe(0);
      expect(result.isBust).toBe(true);
      expect(result.resultType).toBe("bust");
    });

    it("doubles bank on doubles", () => {
      const result = calculateRollResult(3, 3, 5, 100, 0, options);
      expect(result.newBankTotal).toBe(200);
      expect(result.isBust).toBe(false);
    });

    it("adds face value for normal rolls", () => {
      const result = calculateRollResult(4, 5, 6, 100, 0, options);
      expect(result.newBankTotal).toBe(109); // 100 + 9
    });
  });

  describe("Snake Eyes Bonus", () => {
    it("quadruples bank with snake eyes bonus enabled", () => {
      const snakeEyesOptions = { ...options, snakeEyesBonus: true };
      const result = calculateRollResult(1, 1, 4, 100, 0, snakeEyesOptions);
      expect(result.newBankTotal).toBe(400); // 100 * 4
    });

    it("doubles bank with snake eyes when bonus disabled", () => {
      const result = calculateRollResult(1, 1, 4, 100, 0, options);
      expect(result.newBankTotal).toBe(200); // 100 * 2 (normal doubles)
    });
  });

  describe("Lucky 11 Bonus", () => {
    it("quadruples the bank for rolling 11", () => {
      const lucky11Options = { ...options, lucky11: true };
      const result = calculateRollResult(5, 6, 1, 50, 0, lucky11Options);
      expect(result.newBankTotal).toBe(244); // (50 + 11) * 4 = 244
    });

    it("no bonus without option enabled", () => {
      const result = calculateRollResult(5, 6, 1, 50, 0, options);
      expect(result.newBankTotal).toBe(61); // 50 + 11
    });
  });

  describe("Escalating Doubles", () => {
    it("increases multiplier for consecutive doubles", () => {
      const escalatingOptions = { ...options, escalatingDoubles: true };

      // First double in danger zone = x2
      const first = calculateRollResult(2, 2, 4, 100, 0, escalatingOptions);
      expect(first.newBankTotal).toBe(200);

      // Second consecutive double = x3
      const second = calculateRollResult(3, 3, 5, 100, 1, escalatingOptions);
      expect(second.newBankTotal).toBe(300);

      // Third consecutive double = x4
      const third = calculateRollResult(4, 4, 6, 100, 2, escalatingOptions);
      expect(third.newBankTotal).toBe(400);
    });
  });
});

describe("calculateStartingBank", () => {
  it("returns 0 without escalating bank", () => {
    expect(calculateStartingBank(5, DEFAULT_GAME_OPTIONS)).toBe(0);
  });

  it("returns round * 100 with escalating bank", () => {
    const options = { ...DEFAULT_GAME_OPTIONS, escalatingBank: true };
    expect(calculateStartingBank(1, options)).toBe(100);
    expect(calculateStartingBank(5, options)).toBe(500);
    expect(calculateStartingBank(15, options)).toBe(1500);
  });
});

describe("canPlayerBank", () => {
  it("allows banking when conditions are met", () => {
    const result = canPlayerBank(100, 0, false);
    expect(result.canBank).toBe(true);
  });

  it("prevents banking if already banked", () => {
    const result = canPlayerBank(100, 0, true);
    expect(result.canBank).toBe(false);
    expect(result.reason).toContain("Already banked");
  });

  it("prevents banking below minimum", () => {
    const result = canPlayerBank(100, 200, false);
    expect(result.canBank).toBe(false);
    expect(result.reason).toContain("must be over 200");
  });

  it("allows banking at exactly minimum + 1", () => {
    const result = canPlayerBank(201, 200, false);
    expect(result.canBank).toBe(true);
  });
});

describe("calculateBankPoints", () => {
  it("returns bank total without double down", () => {
    expect(calculateBankPoints(500, false)).toBe(500);
  });

  it("doubles points with double down active", () => {
    expect(calculateBankPoints(500, true)).toBe(1000);
  });
});

describe("generateJoinCode", () => {
  it("generates 8 character codes", () => {
    const code = generateJoinCode();
    expect(code.length).toBe(8);
  });

  it("only uses valid characters", () => {
    const code = generateJoinCode();
    const validChars = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/;
    expect(validChars.test(code)).toBe(true);
  });

  it("generates unique codes", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateJoinCode());
    }
    // Very unlikely to have collisions in 100 codes
    expect(codes.size).toBe(100);
  });
});

describe("isValidJoinCode", () => {
  it("accepts valid codes", () => {
    expect(isValidJoinCode("ABCD1234")).toBe(false); // Has 1
    expect(isValidJoinCode("ABCD2345")).toBe(true);
    expect(isValidJoinCode("HKMNPQRS")).toBe(true);
  });

  it("rejects invalid codes", () => {
    expect(isValidJoinCode("ABC")).toBe(false); // Too short
    expect(isValidJoinCode("ABCDEFGHI")).toBe(false); // Too long
    expect(isValidJoinCode("ABCD0123")).toBe(false); // Has 0 and 1
    expect(isValidJoinCode("abcd2345")).toBe(true); // Lowercase is ok (normalized)
  });
});

describe("getCurrentTurnPosition", () => {
  it("cycles through players correctly", () => {
    const totalPlayers = 4;
    expect(getCurrentTurnPosition(1, totalPlayers)).toBe(1);
    expect(getCurrentTurnPosition(2, totalPlayers)).toBe(2);
    expect(getCurrentTurnPosition(3, totalPlayers)).toBe(3);
    expect(getCurrentTurnPosition(4, totalPlayers)).toBe(4);
    expect(getCurrentTurnPosition(5, totalPlayers)).toBe(1); // Cycles back
    expect(getCurrentTurnPosition(6, totalPlayers)).toBe(2);
  });
});

describe("isInSafeZone", () => {
  it("correctly identifies safe zone", () => {
    expect(isInSafeZone(1, 3)).toBe(true);
    expect(isInSafeZone(3, 3)).toBe(true);
    expect(isInSafeZone(4, 3)).toBe(false);
  });

  it("respects custom safe zone size", () => {
    expect(isInSafeZone(5, 5)).toBe(true);
    expect(isInSafeZone(6, 5)).toBe(false);
  });
});

describe("allPlayersBanked", () => {
  it("returns true when all have banked", () => {
    const players = [
      { hasBanked: true },
      { hasBanked: true },
      { hasBanked: true },
    ];
    expect(allPlayersBanked(players)).toBe(true);
  });

  it("returns false when some haven't banked", () => {
    const players = [
      { hasBanked: true },
      { hasBanked: false },
      { hasBanked: true },
    ];
    expect(allPlayersBanked(players)).toBe(false);
  });
});
