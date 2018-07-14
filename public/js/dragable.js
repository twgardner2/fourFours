// To Do:
/// Add factorial
/// Evaluation: prevent until at least 3 binary operators added
/// Remove Bootstrap?


var activeRow = 0;
var activeRowId = "#foursRow0";

// var tileType = null;
var dragSourceElement = null;
var tileValue = null;

var tokenizedExpression;
var parsedExpression;



$(document).ready(function() {

  $('#startButton').on('click', playButtonClick);
  // $('#buttonEval').on('click', evalExpression);
  // $('#buttonReset').on('click', resetRow);

  attachDragDropEventListeners()

  // new Draggable(containers: '#operatorTiles', options: {}): Draggable;
  // const draggable = new Draggable.Draggable(document.querySelectorAll('#operatorTiles'), {
  //   draggable: 'div'
  // });
  // draggable.on('drag:start', () => console.log('drag:start'));
  // draggable.on('drag:move', () => console.log('drag:move'));
  // draggable.on('drag:stop', () => console.log('drag:stop'));

  document.querySelector("body").addEventListener("click", clickPositionToConsole);

  // document.querySelector("body").childNodes.forEach(function(node) {
  //   console.log(node);
  //   node.addEventListener("click", getElementPosition);
  // });
  // document.querySelectorAll('body *').forEach(function(node) {
  //   console.log(node);
  //   node.addEventListener("click", getElementPosition);
  // });

})

// Drag Events

function handleDragStart(e) {
  // console.log(`running 'handleDragStart'...`);
  $(this).addClass('duringDrag').removeClass('draggable');

  dragSourceElement = this;
  e.originalEvent.dataTransfer.effectAllowed = 'copy';
  e.originalEvent.dataTransfer.setData('text/html', this.innerHTML);
  e.originalEvent.dataTransfer.setData('text/plain', this.dataset.value);
  e.originalEvent.dataTransfer.setData("text", e.target.id);
  e.originalEvent.dataTransfer.setData("tile", e.target.dataset.operator);

  // e.originalEvent.dataTransfer.setData('operatorType', this.dataset.operatorType);
  // tileType = this.dataset.operatorType;
  tileValue = this.dataset.operator;
}

function handleDragEnd() {
  // console.log(`running 'handleDragEnd'...`);

  $(this).addClass('draggable').removeClass('duringDrag');
}

function handleDragOver(e) {
  // console.log(`running 'handleDragOver'...`);

  if (e.preventDefault) {
    e.preventDefault();
  }
  e.originalEvent.dataTransfer.dropEffect = 'copy';
  return false;
}

function handleDragEnter(e) {
  // console.log(`running 'handleDragEnter'...`);

  $(this).addClass('over');

}

function handleDragLeave() {
  // console.log(`running 'handleDragLeave'...`);

  $(this).removeClass('over');
}



function newDrop(ev, el) {
  ev.preventDefault();
  if (ev.stopPropagation) ev.stopPropagation();



  if(!ev.target.classList.contains("dropZone")) {
    dropZone = ev.target.closest(".dropZone");
  } else {
    dropZone = ev.target;
  }

  // var dropZone = ev.target;
  console.log(dropZone);

  var dropX = ev.clientX;
  console.log(`Drop X: ${dropX}`);

  var operatorTypeToInsert = ev.originalEvent.dataTransfer.getData("tile");
  var newNode = genTileToDrop(operatorTypeToInsert);

  var nodeToInsertBefore;
  var currentOccupants;
  var currentOccupantsCenterX = [];
  var childrenToRightOfDropX = [];
  var numChildrenToRightOfDropX;

  currentOccupants = dropZone.children;

  for (var i = 0; i < currentOccupants.length; i++) {
    currentOccupantsCenterX.push(getElementCenterX(currentOccupants[i]));
    if (currentOccupantsCenterX[i] > dropX) {
      childrenToRightOfDropX.push(i);
    }
  }
  // console.log('occupant center Xs');
  // console.log(currentOccupantsCenterX);
  // console.log(`# right of drop: ${childrenToRightOfDropX.length}`);

  numChildrenToRightOfDropX = childrenToRightOfDropX.length;
  // console.log(`length torightofdrop: ${childrenToRightOfDropX.length}`);
  // console.log(`el.children.length: ${dropZone.children.length}`);
  nodeToInsertBefore = dropZone.children[ dropZone.children.length - numChildrenToRightOfDropX ];
  // dropZone.insertBefore(document.getElementById(data), el.children[el.children.length - numChildrenToRightOfDropX]);

  dropZone.insertBefore(newNode, nodeToInsertBefore);

  ev.target.classList.remove('over');

  // console.log(`X-position of Current Occupants of Drop Zone: ${currentOccupantsCenterX}`);

  function getElementCenterX(el) {
    var x = el.getBoundingClientRect().x;
    var width = el.getBoundingClientRect().width;

    return x + width / 2;


  }

}





function handleDrop(e) {
  // console.log(`running 'handleDrop'...`);

  if (e.stopPropagation) {
    e.stopPropagation();
  }

  var isCorrect;
  // console.log(this);
  if (dragSourceElement != this && tileType.includes(this.dataset.operatorAccepted)) {
    // this.innerHTML = e.originalEvent.dataTransfer.getData('text/html');
    this.dataset.value = e.originalEvent.dataTransfer.getData('text/plain');
    $(this).removeClass('over plus minus multiply divide').addClass('dropped').addClass(tileValue);
  }
  tileType = null;

  isCorrect = evalExpression();

  return false;
}

// Row Click Functions

function resetDropZone() {
  $(this).html('').removeClass('dropped plus minus multiply divide parensOpen parensClose squared sqrt factorial');
  this.dataset.value = this.dataset.defaultValue;
  evalExpression();
}

function negateFourByClick() {
  if (this.classList.contains('four')) {
    this.classList.remove("four");
    this.classList.add("fourNeg");
    this.dataset.value = this.dataset.valueNegative;
  } else {
    this.classList.remove("fourNeg");
    this.classList.add("four");
    this.dataset.value = this.dataset.valueDefault;
  }
  evalExpression();

}

// Evaluation

function evalExpression() {
  // console.log(`running 'evalExpression'...activeRowId: ${activeRowId}`);

  var lhs = '';
  var requiredResult = null;
  var isCorrect = null;

  $(activeRowId).children("div").each(function(index, el) {
    lhs += el.dataset.value;
  });
  lhs = lhs.replace(/\s/g, '').substring(0, lhs.indexOf("="));

  tokenizedExpression = tokenize(lhs);
  console.log('Tokenized Expression:');
  console.log(tokenizedExpression);
  console.log('\n');

  rpn = parseTokenizedExpressionToRPN(tokenizedExpression);
  console.log('Parsed Expression (RPN):');
  console.log(rpn);
  console.log('\n');

  evaluatedRPN = evaluateRPN(rpn);
  console.log('Result of evaluating RPN:');
  console.log(evaluatedRPN);
  console.log('\n');


  tokenizedExpression = tokenizedExpression.map(el => el.value).join('');
  rpn = rpn.map(el => el.value).join('');

  $('#expression').text(tokenizedExpression);
  $('#expressionRPN').text(rpn);
  $('#evalResult').text(evaluatedRPN);

  if (evaluatedRPN || evaluatedRPN === 0) {

    if (evaluatedRPN === activeRow) {
      $(activeRowId).removeClass('noResult wrongResult horizontal').addClass('rightResult tada');
      $(activeRowId).children().css('border-style', 'none');
      $(`#equalsOrEqualsNot${activeRow}`).removeClass('equalsNot').addClass('equals');
      insertRow();
    } else {
      $(activeRowId).removeClass('noResult rightResult wrongResult tada horizontal').addClass('wrongResult horizontal');
      $(`#equalsOrEqualsNot${activeRow}`).removeClass('equals').addClass('equalsNot');
    }

  } else {
    $(activeRowId).removeClass('noResult rightResult wrongResult tada horizontal').addClass('noResult');

  }

}

function resetRow() {
  $('.dropZone').html('').removeClass('over').removeClass('dropped');
  $(activeRowId).removeClass('rightResult').removeClass('wrongResult');

}

function attachDragDropEventListeners() {
  $('.draggable').on('dragstart', handleDragStart);
  $('.draggable').on('dragend', handleDragEnd);
  $('.dropZone').on('dragover', handleDragOver);
  $('.dropZone').on('dragenter', handleDragEnter);
  $('.dropZone').on('dragleave', handleDragLeave);
  // $('.dropZone').on('drop', function() {console.log("DROP!");});
  $('.foursRow').on('drop', '.dropZone', newDrop);
  // new Draggable.Draggable(document.querySelectorAll('#operatorTiles'), {
  //   draggable: 'div'
  // });

  $('.dropZone').on('click', resetDropZone);
  $('.four').on('click', negateFourByClick);
}

function playButtonClick() {
  insertRow();
  $(this).hide();
  $('#operatorTiles').show();
}

function insertRow() {
  $(activeRowId).addClass('disabled');
  activeRow++;
  activeRowId = `#foursRow${activeRow}`;
  $('#operatorTiles').before(rowGenerator());
  attachDragDropEventListeners();
}

function rowGenerator() {

  newRowHTML = `<div id="foursRow${activeRow}" class="row foursRow noResult"> ` +

    `${genDropZoneDiv("dropZone1")} ${genFourDiv("four1")} ${genDropZoneDiv("dropZone2")} ${genFourDiv("four2")} ${genDropZoneDiv("dropZone3")} ${genFourDiv("four3")} ${genDropZoneDiv("dropZone4")} ${genFourDiv("four4")} ${genDropZoneDiv("dropZone5")}` +

    `${genEqualsDiv("equals")} ${genRequiredResultDiv("result")}` +

    `</div>`;

  return newRowHTML;

  function genFourDiv(gridPositionClass) {
    return `<div class="staticSymbol four ${gridPositionClass}"></div>`;
  }

  function genDropZoneDiv(gridPositionClass) {
    return `<div class="dropZone ${gridPositionClass}"></div>`;

  }

  function genEqualsDiv(gridPositionClass) {
    return `<div id="equalsOrEqualsNot${activeRow}" class="staticSymbol equalsNot ${gridPositionClass}" data-value="="></div>`;
  }

  function genRequiredResultDiv(gridPositionClass) {
    return `<div id="requiredResult" class="staticSymbol ${gridPositionClass}" data-value="${activeRow}"> ${activeRow} </div>`;
  }

}

// div Appenders

function genTileToDrop(operatorTypeToAppend) {
  var newTile;
  newTile = document.createElement('div')
  newTile.classList.add(operatorTypeToAppend, "droppedTile");
  newTile.setAttribute('draggable', 'true');
  newTile.setAttribute('data-operator', operatorTypeToAppend);
  return newTile;

}


// Tokenizing

function Token(type, value) {
  this.type = type;
  this.value = value;
}

function tokenize(lhs) {
  var result = [];
  var numBuffer = [];
  var prevCharRightParens = false;

  // Remove whitespaces
  lhs.replace(/\s+/g, "");
  lhs = lhs.substring(0, lhs.indexOf('='))
  // Split out each character
  lhs = lhs.split('');

  lhs.forEach(function(char, i) {
    console.log(`Token: ${char}`);

    // 'B' is a break character to prevent evaluation
    if (char === "B") {
      console.log('in char === "B" condition');

      result.push(new Token('Break', 'B'));

    } else if (isDigit(char)) {

      if (prevCharRightParens) {
        console.log('PUSH A MULTIPLICATION');

        result.push(new Token('Operator', '*'));
        prevCharRightParens = false;
      }
      numBuffer.push(char);
      prevCharRightParens = false;

    } else if (char === ".") {
      if (prevCharRightParens) {
        console.log('PUSH A MULTIPLICATION');

        result.push(new Token('Operator', '*'));
        prevCharRightParens = false;
      }
      numBuffer.push(char);
      prevCharRightParens = false;

    } else if (isOperator(char)) {
      if (numBuffer.length) {
        emptyNumBufferAsLiteral();
        prevCharRightParens = false;
      }
      result.push(new Token('Operator', char));
      prevCharRightParens = false;

    } else if (isLeftParens(char)) {
      if (numBuffer.length) {
        emptyNumBufferAsLiteral();
        console.log('PUSH A MULTIPLICATION');
        result.push(new Token('Operator', '*'));
      } else if (prevCharRightParens) {
        console.log('PUSH A MULTIPLICATION');
        result.push(new Token('Operator', '*'));
        prevCharRightParens = false;
      }
      result.push(new Token('LeftParens', char));

    } else if (isRightParens(char)) {
      console.log(`token is right parens`);
      if (numBuffer.length) {
        emptyNumBufferAsLiteral();
      }
      result.push(new Token('RightParens', char));
      prevCharRightParens = true;

    } else if (isFactorial(char)) {
      console.log(`token is factorial`);
      if (numBuffer.length) {
        emptyNumBufferAsLiteral();
      }
      result.push(new Token('Factorial', char));
      prevCharRightParens = false;
    }

  });

  function emptyNumBufferAsLiteral() {
    if (numBuffer.length) {
      result.push(new Token('Literal', numBuffer.join('')));
      numBuffer = [];
    }
  }
  // console.log(result);

  return result;
}

// Parsing

function parseTokenizedExpressionToRPN(tokenizedExpression) {
  var stack = [];
  var outputQueue = [];
  var rpn;

  var assoc = {
    '^': 'right',
    '!': 'right',
    '*': 'left',
    '/': 'left',
    '+': 'left',
    '-': 'left',
  };

  var prec = {
    '!': 5,
    '^': 4,
    '*': 3,
    '/': 3,
    '+': 2,
    '-': 2,
  };

  Token.prototype.precedence = function() {
    return prec[this.value];
  };

  Token.prototype.associativity = function() {
    return assoc[this.value];
  };

  Array.prototype.peek = function() {
    return this.slice(-1)[0];
  };

  tokenizedExpression.forEach(function(t) {
    // If Literal, push to output queue'dragable.js'

    if (t.type === "Literal") {
      outputQueue.push(t);
    } else if (t.type === "Operator") {
      while (stack.peek() && (stack.peek().type === "Operator") && ((t.associativity() === "left" && t.precedence() <= stack.peek().precedence()) ||
          (t.associativity() === "right" && t.precedence() < stack.peek().precedence()))) {
        outputQueue.push(stack.pop());
      }
      stack.push(t);
    } else if (t.type === "LeftParens") {
      stack.push(t);
    } else if (t.type === "RightParens") {
      while (stack.peek() && stack.peek().type !== "LeftParens") {
        outputQueue.push(stack.pop());
      }
      stack.pop();
    } else if (t.type === "Factorial") {
      outputQueue.push(t);
    } else if (t.type === "Break") {
      outputQueue.push(t);
    }
  });

  rpn = outputQueue.concat(stack.reverse());

  return rpn;
  // return rpn.map(token => token.value);
  //.join(" ");

}

// Evaluating

function evaluateRPN(rpn) {

  var stack = [];
  var op1;
  var op2;

  rpn.forEach(function(t) {
    // console.log(t);
    // console.log(`Processing token: ${t.value}`);

    if (t.type === 'Literal') {
      // console.log(`pushing literal ${parseFloat(t.value)} to the stack`);
      stack.push(parseFloat(t.value));
      // console.log(stack);

    } else if (t.type === "Operator") {

      op2 = stack.pop(); //console.log(`op2: ${op2}`);
      op1 = stack.pop(); //console.log(`op1: ${op1}`);

      if (t.value === "+") {
        // console.log(`op1+op2: ${op1+op2}`);
        stack.push(op1 + op2);
        // console.log(stack);
      } else if (t.value === "-") {
        // console.log(`op1 - op2: ${op1 - op2}`);
        stack.push(op1 - op2);
        // console.log(stack);
      } else if (t.value === "*") {
        // console.log(`op1 * op2: ${op1 * op2}`);
        stack.push(op1 * op2);
        // console.log(stack);
      } else if (t.value === "/") {
        // console.log(`op1 / op2: ${op1 / op2}`);
        stack.push(op1 / op2);
        // console.log(stack);
      } else if (t.value === "^") {
        // console.log(`op1 ^ op2: ${op1 ** op2}`);
        stack.push(op1 ** op2);
        // console.log(stack);

      }
      // console.log('\n');
    } else if (t.type === "Factorial") {
      op1 = stack.pop();
      stack.push(factorialize(op1));
    } else if (t.type === "Break") {
      stack.push(t.value);
    }
  });
  // console.log(stack.length);
  // console.log(stack);

  if (stack.length === 1) {
    var output;
    output = stack.pop();

    if (output || output === 0) {
      return output;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }

}

// Tokenizing, Parsing, and Evaluating helper functions

function factorialize(num) {
  if (num < 0)
    return -1;
  else if (num == 0)
    return 1;
  else {
    return (num * factorialize(num - 1));
  }
}

function isDigit(ch) {
  return /\d/.test(ch);
}

function isOperator(ch) {
  return /\+|-|\/|\^/.test(ch);
}

function isLeftParens(ch) {
  return (ch === '(');
}

function isRightParens(ch) {
  return (ch === ')');
}

function isFactorial(ch) {
  return (ch === "!");
}









// newDrag Test


function newAllowDrop(ev) {
  ev.preventDefault();
}

function newDrag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}



function clickPositionToConsole(ev, el) {
  console.log(`Click x-coord: ${ev.clientX}`);
}

// function getElementPosition(ev) {
//   ev.stopPropagation();
//   var xPos = 0;
//   var yPos = 0;
//   var el = this;
//   console.log("\n");
//   while (el) {
//     console.log(`Node tag: ${el.tagName} ${el.id}`);
//     console.log(el.getBoundingClientRect());
//     if (el.tagName == "BODY") {
//       var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
//       var yScroll = el.scrollTop || document.documentElement.scrollTop;
//       xPos += (el.offsetLeft - xScroll + el.clientLeft);
//       yPos += (el.offsetTop - yScroll + el.clientTop);
//     } else {
//       xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
//       yPos += (el.offsetTop - el.scrollTop + el.clientTop);
//     }
//     console.log(`x-position: ${xPos}`);
//
//     el = el.offsetParent;
//   }
//   console.log(`final x-position: ${xPos}`);
//   return xPos;
//
//   // return {
//   //   x: xPos,
//   //   y: yPos
//   // };
// }
//








// function genBinaryOperatorDiv(gridPositionClass) {
//   return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="binary" data-default-value="B" data-value="B"></div>`;
// }
//
// function genParensDiv(parensTypeAccepted, gridPositionClass) {
//   return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="${parensTypeAccepted}" data-default-value=" " data-value=" "></div>`;
// }
//
// function genFactorialDiv(gridPositionClass) {
//   return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="factorial" data-default-value=" " data-value=" "></div>`;
// }
//
// function genExpDiv(gridPositionClass) {
//   return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="exponent" data-default-value="^1)" data-value="^1)"></div>`;
// }
