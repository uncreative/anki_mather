generate_note = function(front, back, variables, rules, answers) {
  var seedy = getSeed(front.hashCode());
  var rand = Alea(seedy);
  templateds = calculate_card(variables, rules, answers, [front, back], rand);
  to_html(templateds);
  document.getElementById("templated").innerHTML = templateds[1];

  document.getElementById("txtFront").innerHTML = front;
  document.getElementById("txtBack").innerHTML = back;
  document.getElementById("txtVariables").innerHTML = JSON.stringify(variables);
  document.getElementById("txtRules").innerHTML = JSON.stringify(rules);
  document.getElementById("txtAnswers").innerHTML = JSON.stringify(answers);
};

window.onload = function() {
  generate_note(
    "Find an equation of the line that contains the points (%_x1_%, %_y1_%) and (%_x2_%, %_y2_%)",
    "\\(y = \\frac{%_numerator_%}{%_denominator_%} * x + %_b_%\\)",
    {
      x1: { min: -20, max: 20 },
      x2: { min: -20, max: 20 },
      y1: { min: -20, max: 20 },
      y2: { min: -20, max: 20 }
    },
    ["x2-x1!=0"],
    {
      b: { eval: "y1 - (numerator/denominator)*x1;" },
      denominator: {
        eval: "reduced[1]"
      },
      numerator: {
        eval: "reduced[0]"
      },
      pre_eval:
        "var numerator = y2-y1; var denominator = x2-x1; var reduced = reduce_fraction(numerator, denominator);"
    }
  );
};
