
test('interpExpression works with simple numbers and booleans', function(){
    let val= interpExpression({}, parser.parseExpression("4").value);
    assert(val===4);
  });
  
  test('interpExpression works with multiplication and division(no variables)', function(){
    let val= interpExpression({}, parser.parseExpression("6/2").value);
    let val1= interpExpression({}, parser.parseExpression("6*2").value);
    assert(val===3);
    assert(val1===12);
  });
  
  test('interpExpression works with addition and subtraction(no variables)', function(){
    let val= interpExpression({}, parser.parseExpression("6-2").value);
    let val1= interpExpression({}, parser.parseExpression("6+2").value);
    assert(val===4);
    assert(val1===8);
  });
  
  test('interpExpression type check fails with math operators', function(){
     let val= interpExpression({}, parser.parseExpression("true-2").value);
  
  });
  
  test('interpExpression works with comparison operators', function(){
    let val= interpExpression({}, parser.parseExpression("6>2").value);
    assert(val===true);
  });
  
  test('interpExpression and boolean operators', function(){
    let val= interpExpression({}, parser.parseExpression("false||false").value);
    let val1= interpExpression({}, parser.parseExpression("false&&true").value);
    assert(val===false);
    assert(val1===false);
  });
  test('boolean operator type check error', function(){
    let val= interpExpression({}, parser.parseExpression("5||true").value);
  
  });
  
  test('short circuiting check', function(){
    let val= interpExpression({}, parser.parseExpression("true||5").value);
    assert(val===true);
  });
  
  test('comparison operator check', function(){
    let va= interpExpression({}, parser.parseExpression("3===true").value);
    assert(va===false);
  });
  
  test('comparison operator works correctly', function(){
    let val= interpExpression({},parser.parseExpression("5===5").value);
    assert(val===true);
  });
  
  test('interpExpression and variables (no scoping)', function(){
    let val= interpExpression({x:5}, parser.parseExpression("x>5").value);
    assert(val===false);
  });
  
  test(" let statement check", function(){
    let finals= interpProgram(parser.parseProgram("let x=1;").value);
  });
  test("assignment", function() {
  let st = interpProgram(parser.parseProgram("let x = 10; x = 20;").value);
  assert(st.x === 20);
  });
  test('if statement and variable out of scope', function(){
    let st= interpProgram(parser.parseProgram("let x=9; if(x<10){x=x+5;} else{x=x+0;}").value);
    assert(st.x===14);
  });
  test('factorial program', function(){
    let finals= interpProgram(parser.parseProgram("let fact=1;let num=6; while(num>0){fact=fact*num; num=num-1;}").value);
    assert(finals.fact===720);
  });
  
  test('infinity as a number', function(){
    let finals= interpExpression({},{
    kind: "operator",
    op: "+",
    e1: {
      kind: "number",
      value: Infinity
    },
    e2: {
      kind: "number",
      value: 4
    }});
    assert(finals===Infinity);
  });
  
  test('Infinity part2', function(){
    let finals= interpExpression({},{
    kind: "operator",
    op: "+",
    e1: {
      kind: "number",
      value: Infinity
    },
    e2: {
      kind: "number",
      value: Infinity
    }});
    assert(finals===Infinity);
  });
  
  test('Infinity-Infinity returns NaN', function(){
    let finals= interpExpression({},{
    kind: "operator",
    op: "/",
    e1: {
      kind: "number",
      value: Infinity
    },
    e2: {
      kind: "number",
      value: Infinity
    }});
    assert(finals.toString()==='NaN');
  });
  
  test('redeclaring variable aborts the program', function(){
    let finals= interpProgram([{ kind: "let", name: "x", expression: { kind: "number", value: 10 } },{ kind: "let", name: "x", expression: { kind: "number", value: 9 } }]);
  });
  
  test('AST interpret', function(){
    let st= interpProgram([
  { kind: "let", name: "x", expression: { kind: "number", value: 10 } },
  { kind: "assignment", name: "x",
  expression: {
  kind: "operator", op: "*", e1: { kind: "variable", name: "x" },
  e2: { kind: "number", value: 2 } } } ]);
  assert(st.x===20);
  });
  
  test('if statement with new scope and no else', function(){
    let st= interpProgram(parser.parseProgram("let x=5; if(x<10){let y=2; x=x+y;} else{}").value);
    assert(st.x===7);
  });
  
  test('while scoping', function(){
    let st= interpProgram(parser.parseProgram("let x=5; while(x<10){let y=2; x=x+y;}").value);
    assert(st.x===11);
  });
  
  test('print error', function(){
    let st=interpProgram([
    {
      kind: "print",
      expression: {
        kind: "variable",
        name: "x"
      }
    }
  ] );
  });
  
  test('if statement with new scope and then global scope', function(){
    let st= interpProgram(parser.parseProgram("let x=5; if(x<10){let y=2; x=x+y;} else{} let z=5; x=x*5;").value);
    assert(st.x===35);
  });
  
  test('while test', function(){
   let st= interpProgram([{kind:"let" ,name:"x",expression: { kind: "number", value: 10 }},
   {kind:"let",name: "y",expression:{kind:"number",value: 20}},{kind:"while",test: {
        kind: "operator",
        op: ">",
        e1: {
          kind: "variable",
          name: "x"
        },
        e2: {
          kind: "variable",
          name: "y"
        }
      },body:[{kind:"assignment",name:"x", expression:{kind:"operator",op:"+",e1:{ kind:"variable",name:"x"},e2:{kind:"number",value:1}}},
      {kind:"let ", name:"x",expression:{kind:"number",value:30}}, 
      {kind:"assignment",name:"y", expression:{kind:"operator",op:"+",e1:{ kind:"variable",name:"x"},e2:{kind:"variable",name:"y"}}}]}]);
  assert(st.x===10);
  assert(st.y===20);
  });
  
  test('divide by 0', function(){
    let st= interpExpression({},parser.parseExpression("3/0").value);
    assert(st===Infinity);
  });
  
  test('short circuiting &&', function(){
    let st= interpExpression({},parser.parseExpression("true || (4 && 4)").value);
  
  });
  
  let st= interpProgram(parser.parseProgram("let x=5; if(x<10){let y=2; x=x+y;} else{} let z=5; x=x*5;").value);
  
  
  let finals= interpProgram(parser.parseProgram("let fact=1;let num=6; while(num>0){fact=fact*num; num=num-1;}").value);
  console.log(finals);