String.prototype.hashCode = function() {
  var hash = 0,
    i,
    chr,
    len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
getSeed = function(s) {
  var days = Math.floor(Date.now() / 86400000);
  return days + s;
};

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
Alea = function(seed) {
  if (seed === undefined) {
    seed = +new Date() + Math.random();
  }

  function Mash() {
    var n = 4022871197;
    return function(r) {
      for (var t, s, u = 0, e = 0.02519603282416938; u < r.length; u++)
        (s = r.charCodeAt(u)),
          (f = e * (n += s) - ((n * e) | 0)),
          (n = 4294967296 * ((t = f * ((e * n) | 0)) - (t | 0)) + (t | 0));
      return (n | 0) * 2.3283064365386963e-10;
    };
  }
  return (function() {
    var m = Mash(),
      a = m(" "),
      b = m(" "),
      c = m(" "),
      x = 1,
      y;
    (seed = seed.toString()), (a -= m(seed)), (b -= m(seed)), (c -= m(seed));
    a < 0 && a++, b < 0 && b++, c < 0 && c++;
    return function() {
      var y = x * 2.3283064365386963e-10 + a * 2091639;
      (a = b), (b = c);
      return (c = y - (x = y | 0));
    };
  })();
};

replaceAll = function(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
};

stripHtml = function(html) {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

generate_vari_value = function(vari, rand) {
  var randy = rand();
  return Math.floor(randy * (vari.max - vari.min) + vari.min);
};

generate_variables_eval = function(evaluated_variables) {
  var evals = Object.keys(evaluated_variables).reduce(function(
    eval_arr,
    var_name
  ) {
    eval_arr.push(
      "var " + var_name + " = " + evaluated_variables[var_name].value + ";"
    );
    return eval_arr;
  },
  []);
  return evals.join("\n");
};
reduce_fraction = function(numerator, denominator) {
  var gcd = function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  };
  gcd = gcd(numerator, denominator);
  return [numerator / gcd, denominator / gcd];
};

evaluate_answer = function(evaluated_variables, answers) {
  var varis_eval = generate_variables_eval(evaluated_variables);
  var pre_eval = "";
  if (Object.prototype.hasOwnProperty.call(answers, "pre_eval")) {
    pre_eval = answers.pre_eval;
  }
  var evaluated_answers = Object.keys(answers).reduce(function(
    evaluated_answers,
    answer_name
  ) {
    if (answer_name != "pre_eval") {
      var answer = answers[answer_name];
      var evaluated = eval(varis_eval + ";" + pre_eval + ";" + answer.eval);
      evaluated_answers[answer_name] = { value: evaluated };
    }
    return evaluated_answers;
  },
  {});
  return evaluated_answers;
};

evaluate_rule = function(varis_eval, rule) {
  eval(varis_eval);
  return eval(rule);
};

evaluate_rules = function(rules, varis) {
  var varis_eval = generate_variables_eval(varis);

  for (var rule_index in rules) {
    var rule = rules[rule_index].slice(0);
    if (!evaluate_rule(varis_eval, rule)) {
      console.log("failed rule", rule, varis);
      return false;
    }
  }
  return true;
};

generate_variable_values = function(variable_definitions, rules, rand) {
  var attempt = 0;
  var rules_pass = false;
  while (attempt < 5 && rules_pass == false) {
    attempt += 1;
    var evaluated_variables = Object.keys(variable_definitions).reduce(function(
      evaluated_variables,
      var_name
    ) {
      variable_definition = variable_definitions[var_name];
      evaluated_variables[var_name] = {
        value: generate_vari_value(variable_definition, rand)
      };
      return evaluated_variables;
    },
    {});

    rules_pass = evaluate_rules(rules, evaluated_variables);
  }
  return evaluated_variables;
};

fill_template = function(template, values) {
  console.log("fill_template", template, values);
  var templated = template.slice(0);
  templated = Object.keys(values).reduce(function(templated, val_name) {
    var value = values[val_name];
    templated = replaceAll(templated, "%_" + val_name + "_%", value.value);
    return templated;
  }, templated);
  return templated;
};

calculate_card = function(variables, rules, answers, templates, rand) {
  var varis = generate_variable_values(variables, rules, rand);
  var answers = evaluate_answer(varis, answers);
  console.log("answers", answers);

  templateds = templates.reduce(function(templateds, template) {
    templated = fill_template(template, varis);
    templated = fill_template(templated, answers);
    templateds.push(templated);
    return templateds;
  }, []);
  return templateds;
};

format_card_input = function(
  variables_inp,
  rules_inp,
  answer_inp,
  template_inps
) {
  var seedy = getSeed(template_inps[0].hashCode());
  var rand = Alea(seedy);
  var variables = JSON.parse(variables_inp);
  var rules = JSON.parse(rules_inp);
  var answers = JSON.parse(answer_inp);
  var templateds = calculate_card(
    variables,
    rules,
    answers,
    template_inps,
    rand
  );
  return templateds;
};

process_card = function() {
  var answer_inp = stripHtml(function() {
    /*{{Answer}}*/
  })
    .toString()
    .replace(/^[^\/]+\/\*!?/, "")
    .replace(/\*\/[^\/]+$/, "");
  var variables_inp = stripHtml(function() {
    /*{{Variables}}*/
  })
    .toString()
    .replace(/^[^\/]+\/\*!?/, "")
    .replace(/\*\/[^\/]+$/, "");
  var rules_inp = stripHtml(function() {
    /*{{Rules}}*/
  })
    .toString()
    .replace(/^[^\/]+\/\*!?/, "")
    .replace(/\*\/[^\/]+$/, "");
  var template_inp = function() {
    /*{{Front}}*/
  }
    .toString()
    .replace(/^[^\/]+\/\*!?/, "")
    .replace(/\*\/[^\/]+$/, "");
  var back_template_inp = function() {
    /*{{Back}}*/
  }
    .toString()
    .replace(/^[^\/]+\/\*!?/, "")
    .replace(/\*\/[^\/]+$/, "");
  var templateds = format_card_input(variables_inp, rules_inp, answer_inp, [
    template_inp,
    back_template_inp
  ]);

  document.getElementById("templatedFront").innerHTML = templateds[0];
  document.getElementById("templated").innerHTML = templateds[1];

  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  MathJax.Hub.Queue(["Update", MathJax.Hub]);
  MathJax.Hub.Queue(["Rerender", MathJax.Hub]);
};
(module.exports = generate_variable_values),
  calculate_card,
  reduce_fraction,
  evaluate_answer,
  generate_vari_value,
  generate_variable_values,
  getSeed;
