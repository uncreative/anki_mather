require("./front");

const RealDate = Date;

describe("test generating problems with ranged variables", () => {
  function mockDate(isoDate) {
    global.Date = class extends RealDate {
      constructor() {
        return new RealDate(isoDate);
      }
    };
  }
  var variables = {
    x1: { min: -10, max: 10 },
    x2: { min: -10, max: 10 },
    y1: { min: -10, max: 10 },
    y2: { min: -10, max: 10 }
  };
  var answers = {
    numerator: { eval: "y2-y1" },
    denominator: { eval: "x2-x1" }
  };
  var front =
    "Find the slope of the line containing the points (%x1%, %y1%) and (%x2%, %y2%).";
  var bad_values_seed = -1011170816;

  afterEach(() => {
    global.Date = RealDate;
  });

  test("generate_vari_value between min and max", () => {
    var seedy = getSeed("(y2-y1)/(x2-x1)".hashCode());
    var rand = Alea(seedy);
    var v = generate_vari_value(
      {
        min: -10,
        max: 10
      },

      rand
    );
    expect(v).toBeLessThanOrEqual(10);
    expect(v).toBeGreaterThanOrEqual(-10);
  });

  test("generate_variable_values x2-x1 == 0 when using bad_values_seed", () => {
    var rules = [];
    var rand = Alea(bad_values_seed);

    expect(generate_variable_values(variables, rules, rand)).toEqual({
      x1: {
        value: 0
      },
      x2: {
        value: 0
      },
      y1: {
        value: -10
      },
      y2: {
        value: 2
      }
    });
  });
  test("generate_variable_values x2-x1 != 0 when using bad_values_seed and foribidding rule", () => {
    var rules = ["(x2-x1) != 0"];
    var rand = Alea(bad_values_seed);

    expect(generate_variable_values(variables, rules, rand)).toEqual({
      x1: {
        value: 7
      },
      x2: {
        value: -6
      },
      y1: {
        value: -4
      },
      y2: {
        value: 6
      }
    });
    // but tries again when rules forbid x2-x1 to be 0
  });

  test("evaluate_rule x2-x1!=0 is true for 3 and 2", () => {
    expect(evaluate_rule("var x1= 3; var x2 = 2;", "(x2-x1) != 0")).toEqual(
      true
    );
  });
  test("evaluate_rule (x2-x1)!=0 is false for 3 and 3", () => {
    expect(evaluate_rule("var x1= 3; var x2 = 3;", "(x2-x1) != 0")).toEqual(
      false
    );
  });
  test("reduce_fraction 3/9", () => {
    expect(reduce_fraction(3, 9)).toEqual([1, 3]);
  });

  test("reduce_fraction 1024/16384", () => {
    expect(reduce_fraction(1024, 16384)).toEqual([1, 16]);
  });

  test("reduce_fraction 9/3", () => {
    expect(reduce_fraction(9, 3)).toEqual([3, 1]);
  });

  test("reduce_fraction 0/9", () => {
    expect(reduce_fraction(0, 9)).toEqual([0, 1]);
  });

  test("evaluate_answer is 4/3 for (12-0)/(16-0) with pre_eval that simpilifies fractions ", () => {
    var evaluated_variables = {
      x1: {
        value: 16
      },
      x2: {
        value: 0
      },
      y1: {
        value: 12
      },
      y2: {
        value: 0
      }
    };
    var simplified_answers = {
      pre_eval:
        "numerator = y2-y1; \
      denominator = x2-x1; \
      reduced = reduce_fraction(numerator, denominator);",
      numerator: { eval: "reduced[0]" },
      denominator: { eval: "reduced[1]" }
    };

    expect(evaluate_answer(evaluated_variables, simplified_answers)).toEqual({
      denominator: { value: 4 },
      numerator: { value: 3 }
    });
  });
  test("calculate_card generates templates (7,-4) and (-6,6) as well as m=10/-13", () => {
    mockDate("2018-07-17T22:34:56z");
    var simplified_answers = {
      pre_eval:
        "numerator = y2-y1; \
      denominator = x2-x1; \
      reduced = reduce_fraction(numerator, denominator);",
      numerator: { eval: "reduced[0]" },
      denominator: { eval: "reduced[1]" }
    };
    var rules = ["(x2-x1) != 0"];
    var front =
      "Find the slope of the line containing the points (%_x1_%, %_y1_%) and (%_x2_%, %_y2_%).";
    var rand = Alea(getSeed(front.hashCode()));
    var back = "m = %_numerator_%/%_denominator_%";
    var expectedFront =
      "Find the slope of the line containing the points (-3, 8) and (1, -2).";
    var expectedBack = "m = 5/-2";
    expect(
      calculate_card(variables, rules, simplified_answers, [front, back], rand)
    ).toEqual([expectedFront, expectedBack]);
  });
});
