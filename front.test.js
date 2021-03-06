require("./front");

const RealDate = Date;

test("evaluate_rule x2-x1!=0 is true for 3 and 2", () => {
  expect(evaluate_rule("var x1= 3; var x2 = 2;", "(x2-x1) != 0")).toEqual(true);
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

describe("test generating variables with ranged variables", () => {
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
});

describe("test generating problems with simplified fraction answer", () => {
  function mockDate(isoDate) {
    global.Date = class extends RealDate {
      constructor() {
        return new RealDate(isoDate);
      }
    };
  }

  var simplified_answers = {
    pre_eval:
      "numerator = y2-y1; \
        denominator = x2-x1; \
        reduced = reduce_fraction(numerator, denominator);",
    numerator: { eval: "reduced[0]" },
    denominator: { eval: "reduced[1]" }
  };
  var rules = ["(x2-x1) != 0"];

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

    expect(evaluate_answer(evaluated_variables, simplified_answers)).toEqual({
      denominator: { value: 4 },
      numerator: { value: 3 }
    });
  });
  test("calculate_card generates templates (7,-4) and (-6,6) as well as m=10/-13", () => {
    var variables = {
      x1: { min: -10, max: 10 },
      x2: { min: -10, max: 10 },
      y1: { min: -10, max: 10 },
      y2: { min: -10, max: 10 }
    };

    var front =
      "Find the slope of the line containing the points (%_x1_%, %_y1_%) and (%_x2_%, %_y2_%).";
    var rand = Alea(-1947058078); //Alea(​​​​​-1947058080​​​​​);
    var back = "m = %_numerator_%/%_denominator_%";
    var expectedFront =
      "Find the slope of the line containing the points (1, 2) and (-7, 8).";
    var expectedBack = "m = -3/4";
    expect(
      calculate_card(variables, rules, simplified_answers, [front, back], rand)
    ).toEqual([expectedFront, expectedBack]);
  });
});

describe("generate variables with tenths", () => {
  var variables = {
    per_mile: {
      min: 1,
      max: 9,
      post_eval: "(some_random_num / 10).toFixed(2)"
    },
    rent_per_day: { min: 20, max: 50 }
  };
  var front =
    "A rental company charges $%_rent_per_day_% per day to rent a car plus $%_per_mile_% per mile. Find an equation that gives the daily rental in terms of the number of miles driven.";
  var rules = [];
  test("generate_variable_values in 10ths", () => {
    var rand = Alea(7); //7

    expect(generate_variable_values(variables, rules, rand)).toEqual({
      per_mile: {
        value: "0.30"
      },
      rent_per_day: {
        value: 20
      }
    });
  });
});
