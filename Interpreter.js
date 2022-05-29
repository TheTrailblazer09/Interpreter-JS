//interpProgram(p: Stmt[]): State
function interpProgram(ps){
 let state={};
 ps.forEach(x=>{
   // goes through every statement in the array
   interpStatement(state,x);
  });
 return state;// final state is returned
}

function interpBlock(state,expressions){
  let newState={};// new scope is formed on entering a block
  lib220.setProperty(newState,'outer',state);// linked to outer scope
  console.log(newState);
  expressions.forEach(x=>{interpStatement(newState, x);});
}

function interpStatement(state,p){
  switch(p.kind){
    case 'let':{
      if(lib220.getProperty(state, p.name).found){
        console.log("variable already exists");
        assert(false);
      }
      let value = interpExpression(state, p.expression);// value is interpreted
      lib220.setProperty(state, p.name, value); // value is set to the variable
      break;
    }
    case 'assignment':{
      let value = interpExpression(state, p.expression);
      if(!lib220.getProperty(state, p.name).found){// if variable isn't in the nearest scope
        let scope= traverser(state,p.name);
        if(scope.found===true){// if it's found in ann outer scope
          lib220.setProperty(scope.block, p.name, value);
        }
        else{
          console.log("variable is not declared");
           assert(false);
        } 
      }
      else{
        // variable is in the nearest scope
        lib220.setProperty(state, p.name, value); 
      }
      break;
    }
    case 'if':{
      let value = interpExpression(state, p.test);
      if(value){
        interpBlock(state,p.truePart);// new block
      }
      else{
        interpBlock(state,p.falsePart);// new block
      }
      break;
    }
    case 'while':{
      if(interpExpression(state,p.test)){
       whileHelper(state,p);// calls interpBlock each iteration and executes the statements
      }
      break;
    }

    case 'print':{
      let value= interpExpression(state,p.expression);
      console.log(value);// prints the expression
      break;
    }
    default:{
      console.log("INVALID STATEMENT");
      assert(false);
      break;
    }
  }
}

function whileHelper(state,p){
  let value= interpExpression(state,p.test);
  if(!value){
    return state;
  }
  interpBlock(state,p.body);
  return whileHelper(state,p);
}

function traverser(inner2,variable){
  // traverses through scopes to find the scope in which this variable might be found
  let found=true;
  while(!lib220.getProperty(inner2, variable).found){
    if(lib220.getProperty(inner2, 'outer').found){
      inner2= inner2.outer;
    }
    else{
      found=false;
      break;
    }
  }
  if(found){
    return {found:true, value: lib220.getProperty(inner2,variable).value, block: inner2};
  }
  else{
    return {found:false};
  }
}

function interpExpression(stateobj, exp) {
  let returnValue=interpExpressionHelper(stateobj,exp)
  return returnValue.value;
}

function interpExpressionHelper(state,e){
  if (e.kind === 'number'|| e.kind === "boolean"){
    return { type: e.kind, value: e.value };
  } 
  else if (e.kind === 'operator') {
    let v1 = interpExpressionHelper(state,e.e1);
    let v2 = interpExpressionHelper(state,e.e2);
   if(mathOp(e.op)|| compOp(e.op)){
     // if it's a math operator both sides need to be a number
     if(v1.type === 'number' && v2.type === 'number'){
       return val(e.op,v1,v2);
     }
     else{
      console.log("Invalid types");
      assert(false);
     }
     
   }
   else if(boolOp(e.op)){
     // if it's a boolean operator atleast one sides need to be booleans
     if(v1.type === "boolean" && v2.type === "boolean"){
      return val(e.op,v1,v2);
     }
     else{
       if(e.op==='||'&& v1.value===true){
          return {type:'boolean', value:true};
       }
       else if(e.op==='&&' && v1.value===false){
         return {type:'boolean', value:false};
       }
       else{
         console.log("Invalid types");
         assert(false);
       }
     }
   }
   
   else if(e.op==='==='){
     // no type checks for ===
     return val(e.op,v1,v2);
   }
   else{
     console.log("Invalid Operator");
     assert(false);
   }
  } 
  else if(e.kind ==='variable'){
    if(!lib220.getProperty(state, e.name).found){
      // if variable not found in the nearest scope
      let scope= traverser(state,e.name);
      if(scope.found===true){
        let val=scope.value; 
        return {type: typeof(val), value:val };
      }
      else{
        console.log("variable not found");
        assert(false);
      }
    }
    else{
    let val= lib220.getProperty(state, e.name).value;
    return {type: typeof(val), value:val };
    }
  }
  else {
    console.log("Invalid expression kind");
    assert(false);
  }
  
}


function mathOp(op){
  // check if it is a math operator
  return op==='+'|| op==='-'||op==='/'|| op==='*';
}

function boolOp(op){
  // check if it is a boolean operator
  return op=== '&&'|| op==='||';
}

function compOp(op){
  // check if it is a comparsion operator
  return op==='>' || op==='<';
}

function val(op,v1,v2){
  let vals=-1;
  let typ= undefined;
  switch(op){
    case '+': {
      vals=v1.value + v2.value;
      typ='number';
      break;
    }
    case '-': {
      vals= v1.value- v2.value;
      typ='number';
      break;
    }
    case '*': {
      vals= v1.value * v2.value;
      typ='number';
      break;
    }
    case '/': {
     vals= v1.value/v2.value;
     typ='number';
     break;
    }
    case '&&': {
      vals = v1.value && v2.value;
      typ='boolean';
      break;
    }
    case '||':{
      vals= v1.value || v2.value;
      typ='boolean';
      break;
    }
    case '>' :{
      assert(v1.type==='number' && v2.type==='number');
      vals= v1.value> v2.value;
      typ='boolean';
      break;
    }
    case '<' : {
      assert(v1.type==='number' && v2.type==='number');
      vals= v1.value < v2.value;
      typ='boolean';
      break;
    }
    case '===' : {
      vals = v1.value=== v2.value;
      typ='boolean';
      break;
    }
    default:{
      vals=-1;
      typ='undefined';
      break;
    }
  }
  return {type: typ, value: vals};
}

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