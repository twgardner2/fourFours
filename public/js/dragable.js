// To Do:
/// Add factorial
/// Evaluation: prevent until at least 3 binary operators added
/// Remove Bootstrap?


var activeRow = 0;
var activeRowId = "#foursRow0";

var dragSourceElement = null;
var tileType = null;
var tileValue = null;

var tokenizedExpression;
var parsedExpression;



$(document).ready(function() {

  $('#startButton').on('click', playButtonClick);
  // $('#buttonEval').on('click', evalExpression);
  // $('#buttonReset').on('click', resetRow);

  attachDragDropEventListeners()

  // new Draggable(containers: '#operatorTiles', options: {}): Draggable;
  const draggable = new Draggable.Draggable(document.querySelectorAll('#operatorTiles'), {
    draggable: 'div'
  });
  draggable.on('drag:start', () => console.log('drag:start'));
  draggable.on('drag:move', () => console.log('drag:move'));
  draggable.on('drag:stop', () => console.log('drag:stop'));

})

// Drag Events

function handleDragStart(e) {
  // console.log(`running 'handleDragStart'...`);
  $(this).addClass('duringDrag').removeClass('draggable');

  dragSourceElement = this;
  e.originalEvent.dataTransfer.effectAllowed = 'move';
  e.originalEvent.dataTransfer.setData('text/html', this.innerHTML);
  e.originalEvent.dataTransfer.setData('text/plain', this.dataset.value);

  e.originalEvent.dataTransfer.setData('operatorType', this.dataset.operatorType);
  tileType = this.dataset.operatorType;
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
  e.originalEvent.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  // console.log(`running 'handleDragEnter'...`);

  if (tileType.includes(this.dataset.operatorAccepted)) {
    $(this).addClass('over');
  }

}

function handleDragLeave() {
  // console.log(`running 'handleDragLeave'...`);

  $(this).removeClass('over');
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

  if ( evaluatedRPN || evaluatedRPN === 0 ) {

    if ( evaluatedRPN === activeRow ) {
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
  // $('.draggable').on('dragstart', handleDragStart);
  // $('.draggable').on('dragend', handleDragEnd);
  // $('.dropZone').on('dragover', handleDragOver);
  // $('.dropZone').on('dragenter', handleDragEnter);
  // $('.dropZone').on('dragleave', handleDragLeave);
  // $('.dropZone').on('drop', handleDrop);
  new Draggable.Draggable(document.querySelectorAll('#operatorTiles'), {
    draggable: 'div'
  });

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

  newRowHTML = `  <div id="foursRow${activeRow}" class="row foursRow noResult"> ` +

    `${genParensDiv("parensOpen", "p1")} ${genFourDiv("four1")} ${genFactorialDiv("fact1")}  ${genExpDiv("e1")}` +

    `${genBinaryOperatorDiv("b1")} ${genParensDiv("parensOpen", "p2")} ${genFourDiv("four2")} ${genExpDiv("e2")} ${genParensDiv("parensClose", "p3")}` +

    `${genBinaryOperatorDiv("b2")} ${genParensDiv("parensOpen", "p4")} ${genFourDiv("four3")} ${genExpDiv("e3")} ${genParensDiv("parensClose", "p5")}` +

    `${genBinaryOperatorDiv("b3")}                                     ${genFourDiv("four4")} ${genExpDiv("e4")} ${genParensDiv("parensClose", "p6")}` +

    `${genEqualsDiv("equals")} ${genRequiredResultDiv("result")}` +

    `</div>`;

    return newRowHTML;

    function genFourDiv(gridPositionClass) {
      return `<div class="staticSymbol four ${gridPositionClass}" data-value-default="(4" data-value-negative="((0-4)" data-value="(4"></div>`;
    }

    function genBinaryOperatorDiv(gridPositionClass) {
      return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="binary" data-default-value="B" data-value="B"></div>`;
    }

    function genParensDiv(parensTypeAccepted, gridPositionClass) {
      return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="${parensTypeAccepted}" data-default-value=" " data-value=" "></div>`;
    }

    function genFactorialDiv(gridPositionClass) {
      return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="factorial" data-default-value=" " data-value=" "></div>`;
    }

    function genExpDiv(gridPositionClass) {
      return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="exponent" data-default-value="^1)" data-value="^1)"></div>`;
    }

    function genEqualsDiv(gridPositionClass) {
      return `<div id="equalsOrEqualsNot${activeRow}" class="staticSymbol equalsNot ${gridPositionClass}" data-value="="></div>`;
    }

    function genRequiredResultDiv(gridPositionClass) {
      return `<div id="requiredResult" class="staticSymbol ${gridPositionClass}" data-value="${activeRow}"> ${activeRow} </div>`;
    }

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

    } else if ( isFactorial(char) ) {
      console.log(`token is factorial`);
      if(numBuffer.length) {
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

  rpn.forEach( function(t) {
    // console.log(t);
    console.log(`Processing token: ${t.value}`);

    if ( t.type === 'Literal' ) {
      console.log(`pushing literal ${parseFloat(t.value)} to the stack`);
      stack.push(parseFloat(t.value));
      console.log(stack);

    } else if ( t.type === "Operator" ) {

      op2 = stack.pop(); //console.log(`op2: ${op2}`);
      op1 = stack.pop(); //console.log(`op1: ${op1}`);

      if ( t.value === "+" ) {
        // console.log(`op1+op2: ${op1+op2}`);
        stack.push(op1 + op2);
        console.log(stack);
      } else if ( t.value === "-" ) {
        // console.log(`op1 - op2: ${op1 - op2}`);
        stack.push(op1 - op2);
        console.log(stack);
      } else if ( t.value === "*" ) {
        // console.log(`op1 * op2: ${op1 * op2}`);
        stack.push(op1 * op2);
        console.log(stack);
      } else if ( t.value === "/" ) {
        // console.log(`op1 / op2: ${op1 / op2}`);
        stack.push(op1 / op2);
        console.log(stack);
      } else if (t.value === "^") {
        // console.log(`op1 ^ op2: ${op1 ** op2}`);
        stack.push(op1 ** op2);
        console.log(stack);

      }
      console.log('\n');
    } else if (t.type === "Factorial") {
      op1 = stack.pop();
      stack.push(factorialize(op1));
    } else if (t.type === "Break") {
      stack.push(t.value);
    }
  });
  console.log(stack.length);
  console.log(stack);

  if (stack.length === 1) {
    var output;
    output = stack.pop();

    if(output || output === 0) {
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

function newDrop(ev, el) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");

    var dropX = null;
    dropX = ev.clientX;

    var currentOccupants;
    var currentOccupantsCenterX = [];
    var childrenToRightOfDropX = [];
    var childImmediatelyToRightOfDropX;


    currentOccupants = el.children;

    for (var i = 0; i < currentOccupants.length; i++) {
      currentOccupantsCenterX.push(getOffset(currentOccupants[i]).center_x);
      console.log('currentOccupantsCenterX');
      console.log(currentOccupantsCenterX);
      if ( currentOccupantsCenterX[i] > dropX ) {
        childrenToRightOfDropX.push(i);
      }
      console.log('childrenToRightOfDropX:');
      console.log(childrenToRightOfDropX);
    }

    childImmediatelyToRightOfDropX = Math.min(childrenToRightOfDropX);
    console.log(childImmediatelyToRightOfDropX);

    el.insertBefore(document.getElementById(data), el.children[childImmediatelyToRightOfDropX]);
    // el.appendChild(document.getElementById(data));



    console.log(`X-position of Current Occupants of Drop Zone: ${currentOccupantsCenterX}`);

    function getOffset( el ) {
      var _x = 0;
      var center_x = 0;
      var width = 0;

      var _y = 0;
      var center_y = 0;
      var height = 0;

      while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
          _x += el.offsetLeft - el.scrollLeft;
          center_x = _x + el.offsetWidth/2;

          _y += el.offsetTop - el.scrollTop;
          center_y = _y + el.offsetHeight/2;

          el = el.offsetParent;
      }
      return { top: _y, left: _x, center_y: center_y, center_x: center_x };
    }

}
