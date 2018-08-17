// To Do:
/// Evaluation: prevent until at least 3 binary operators added
/// Remove Bootstrap?

var activeRow = 0;
var activeRowId = "#foursRow0";

var dragSourceElement = null;
var tileValue = null;

// Global variable to correct for mouse offset from center of tile
// when clicking to begin drag
var dragMouseClickToTileCenterOffset;

var tokenizedExpression;
var parsedExpression;


$(document).ready(function() {

  $('#startButton').on('click', playButtonClick);
  // $('#buttonEval').on('click', evalExpression);

  attachDragDropEventListeners()

  document.querySelector("body").addEventListener("click", clickPositionToConsole);

})

// Drag Events

function handleDragStart(e) {
  // console.log(`running 'handleDragStart'...`);
  $(this).addClass('duringDrag').removeClass('draggable');

  dragSourceElement = this;
  e.originalEvent.dataTransfer.effectAllowed = 'copy';
  e.originalEvent.dataTransfer.setData('text/plain', this.dataset.value);
  e.originalEvent.dataTransfer.setData("text", e.target.id);
  e.originalEvent.dataTransfer.setData("tileType", e.target.dataset.operator);
  e.originalEvent.dataTransfer.setData("tileValue", e.target.dataset.value);

  // e.originalEvent.dataTransfer.setData('operatorType', this.dataset.operatorType);
  // tileType = this.dataset.operatorType;
  tileValue = this.dataset.operator;

  // console.log(`e.clientX: ${e.clientX}`);
  // console.log(`clicked tile center x: ${getElementCenterX(this)}\n`);

  dragMouseClickToTileCenterOffset = Math.trunc(e.clientX - getElementCenterX(this));
  // console.log(`dragMouseClickToTileCenterOffset: ${dragMouseClickToTileCenterOffset}`);
}

function handleDragEnd() {
  // console.log(`running 'handleDragEnd'...`);

  $(this).addClass('draggable').removeClass('duringDrag');

  $('.droppedTile').css({
    'right': '0px',
    'top': '0px',
    'opacity': '1'
  });
}

function handleDragOver(e) {
  // console.log(`running 'handleDragOver'...`);

  if (e.preventDefault) {
    e.preventDefault();
  }
  e.originalEvent.dataTransfer.dropEffect = 'copy';
  return false;
}

function droppedTilesMoveAwayWhenDragZoneDraggedOver(ev) {
  ev.preventDefault();
  console.log(' ');

  // Find the dropZone node affected by this event and its children (any operators previously dropped or "occupants")
  var dropZoneNode;
  if (ev.target.classList.contains('droppedTile')) {
    console.log();
    dropZoneNode = ev.target.parentNode;
  } else {
    dropZoneNode = ev.target;
  }
  var occupants = dropZoneNode.childNodes;

  // Determine each occupant's offset numerically (assume equally spaced)
  // Define 'offset' = (occupant's center_x - dropZone's center_x)/(dropZone_width)
  var numOccupantsOfDropZone = dropZoneNode.childNodes.length;
  var dropZoneWidth = dropZoneNode.clientWidth;
  var occupantsCenterOffset = [];
  occupants.forEach(function(occupant, i) {
    var occupantCenterOffset = (1 / numOccupantsOfDropZone) * (0.5 + i) - 0.5;
    occupantsCenterOffset.push(occupantCenterOffset);
  });

  // Determine the offset between the center of the tile being dragged and the center of the dropZone
  // Note: Center of tile being dragged = ev.clientX - dragMouseClickToTileCenterOffset
  var dropZoneCenter = getElementCenterX(dropZoneNode);
  var mouseOffset = ((ev.clientX - dragMouseClickToTileCenterOffset) - dropZoneCenter) / dropZoneWidth;

  // Determine each occupant's mouse mouseOffset
  // Define mouseOffset as the difference between the occupantOffset and mouseOffset
  var occupantsMouseOffset = [];
  occupantsCenterOffset.forEach(function(occupantOffset) {
    occupantsMouseOffset.push(occupantOffset - mouseOffset);
  });

  // Update occupant style for desired effect
  occupants.forEach(function(occupant, index) {
    console.log(`Mouse Position: ${ev.clientX}`);
    console.log(`mouseOffset: ${mouseOffset}`);
    // console.log(`nudgeSine for Child: ${index}: ${nudgeSine(occupantsMouseOffset[index])}`);
    // console.log(-10 * nudgeSine(occupantsMouseOffset[index] * 10) + 'px');
    $(occupant).css({
      'right': -10 * nudgeSine(occupantsMouseOffset[index] * 10) + 'px',
      'top': -5 * Math.abs(nudgeSine(occupantsMouseOffset[index] * 10)) + 'px',
      'opacity': 1 - Math.abs(1.5 * Math.abs(nudgeSine(occupantsMouseOffset[index])))
    });
  });

  // Function to return 1 period of a sine wave
  function nudgeSine(x) {
    if (x < -3.14159 || x > 3.14159) {
      return 0;
    } else {
      return Math.sin(x);
    }
  }

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

  var dropX = ev.clientX - dragMouseClickToTileCenterOffset;

  if (!ev.target.classList.contains("dropZone")) {
    dropZone = ev.target.closest(".dropZone");
  } else {
    dropZone = ev.target;
  }

  var operatorTypeToInsert = ev.originalEvent.dataTransfer.getData("tileType");
  var tileValue = ev.originalEvent.dataTransfer.getData("tileValue");

  var newNode = genTileToDrop(operatorTypeToInsert, tileValue);

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
  nodeToInsertBefore = dropZone.children[dropZone.children.length - numChildrenToRightOfDropX];
  // dropZone.insertBefore(document.getElementById(data), el.children[el.children.length - numChildrenToRightOfDropX]);

  dropZone.insertBefore(newNode, nodeToInsertBefore);

  ev.target.classList.remove('over');


  // ev.target.childNodes.forEach(function(occupant) {
  //   $(occupant).css({'right' : '0px',
  //                    'top' : '0px',
  //                    'opacity' : '1'})
  // });


  // ev.target.childNodes.forEach(function(occupant) {
  //   occupant.style.right = "0px";
  //   occupant.style.opacity = "1.0";
  // });

  // console.log(`X-position of Current Occupants of Drop Zone: ${currentOccupantsCenterX}`);

  isCorrect = evalExpression();

  return false;

}

function getElementCenterX(el) {
  // console.log(`ELEMENT: ${el}`);
  var x = el.getBoundingClientRect().x;
  // console.log(`x: ${x}`);
  var width = el.getBoundingClientRect().width;
  // console.log(`width: ${width}`);

  return x + width / 2;
}

// Row Click Functions

function clearOperatorByClickAndReevaluate() {
  // console.log('CLEAR BY CLICK');
  this.parentNode.removeChild(this);
  evalExpression();
}

function negateFourByClickAndReevaluate() {
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

  var requiredResult = null;
  var isCorrect = null;
  var lhs = constructLHS();

  tokenizedExpression = tokenize(lhs);
  console.log('Tokenized Expression:');
  console.log(tokenizedExpression);
  console.log('\n');

  rpn = parseTokenizedExpressionToRPN(tokenizedExpression);
  // console.log('Parsed Expression (RPN):');
  // console.log(rpn);
  // console.log('\n');

  evaluatedRPN = evaluateRPN(rpn);
  // console.log('Result of evaluating RPN:');
  // console.log(evaluatedRPN);
  // console.log('\n');

  tokenizedExpression = tokenizedExpression.map(el => el.value).join('');
  rpn = rpn.map(el => el.value).join('');

  $('#expression').text(tokenizedExpression);
  $('#expressionRPN').text(rpn);
  $('#evalResult').text(evaluatedRPN);

  if (evaluatedRPN || evaluatedRPN === 0) {

    if (evaluatedRPN === activeRow) {
      $('.foursRowContainer:not(.disabled) > .foursRow').removeClass('noResult wrongResult horizontal').addClass('rightResult tada');

      $('.foursRowContainer:not(.disabled) > .foursRow').children().css('border-style', 'none');

      // $(`#equalsOrEqualsNot${activeRow}`).removeClass('equalsNot').addClass('equals');
      $(`.foursRowContainer:not(.disabled) div[data-value="="]`).removeClass('equalsNot').addClass('equals');

      insertRow();
    } else {
      $('.foursRowContainer:not(.disabled) > .foursRow').removeClass('noResult rightResult wrongResult tada horizontal').addClass('wrongResult horizontal');

      $(`#equalsOrEqualsNot${activeRow}`).removeClass('equals').addClass('equalsNot');
    }

  } else {
    $('.foursRowContainer:not(.disabled) > .foursRow').removeClass('noResult rightResult wrongResult tada horizontal').addClass('noResult');
  }
}

function constructLHS() {
  var lhs = '';
  var children = document.querySelector('.foursRowContainer:not(.disabled) > .foursRow').childNodes;

  console.log(children);
  children.forEach(function(child) {
    if (child.nodeName != "#text") {
      if (child.classList.contains('dropZone')) {
        var grandchildren = child.childNodes;
        grandchildren.forEach(function(grandchild) {
          lhs += grandchild.dataset.value;
          console.log(lhs);
        });
      } else {
        lhs += child.dataset.value;
      }
    }
  });

  lhs = lhs.replace(/\s/g, '').substring(0, lhs.indexOf("="));
  console.log(lhs);
  return lhs;
}

function attachDragDropEventListeners() {
  // .dropZone drag events
  $('.dropZone').on('dragover', handleDragOver);
  $('.dropZone').on('dragover', droppedTilesMoveAwayWhenDragZoneDraggedOver);

  $('.dropZone').on('dragenter', handleDragEnter);
  $('.dropZone').on('dragleave', handleDragLeave);

  $('.foursRow').on('drop', '.dropZone', newDrop);

  // .draggable drag events
  $('.draggable').on('dragstart', handleDragStart);
  $('.draggable').on('dragend', handleDragEnd);


  // .droppedTile drag events
  $('.dropZone').on('dragleave', '.droppedTile', function(ev) {
    this.style.right = "0px";
  });
  $('.dropZone').on('dragleave', '.droppedTile', function(e) {
    e.target.classList.remove('droppedTileBeingDraggedOver');
  });


  $('.dropZone').on('click', '.droppedTile', clearOperatorByClickAndReevaluate);

  $('.four').on('click', negateFourByClickAndReevaluate);
}

function attachSkipButtonListeners() {
  var skipOneButtons = document.querySelectorAll('.skipOneButton');
  skipOneButtons.forEach( function(button) {
    button.addEventListener("click", function(){
      // insertRow();
      updateRowValue();
    });
  });

  var skipToNumButtons = document.querySelectorAll('.skipToNumButton');
  // console.log(`jumpToNum: ${jumpToNum}`);
  skipToNumButtons.forEach( function(button) {
    button.addEventListener("click", function(jumpToNum) {
      // var jumpToNum = parseInt(document.getElementById(`jumpToNum${activeRow}`).value);
      var jumpToNum = parseInt(document.querySelector('.foursRowContainer:not(.disabled) .skipToNumInput').value);

      console.log(jumpToNum);
      // insertRow(newRowNum = parseInt(jumpToNum));
      updateRowValue(newRowNum = parseInt(jumpToNum));

    })
  });
}

function playButtonClick() {
  insertRow();
  $(this).hide();
  $('#operatorTiles').show();
  // document.getElementById("startButton").style.display = "none";
}

function insertRow(newRowNum = null) {
  if( document.querySelector(`.foursRowContainer`) ) {

    document.querySelector('.foursRowContainer:not(.disabled)').classList.add('disabled');

    var skipButtonElements = document.querySelectorAll('.skipButtons');
    skipButtonElements.forEach( function(skipButtonElement) {
      skipButtonElement.style.display = 'none';
    });
  }
  
  if(newRowNum) {
    activeRow = newRowNum
  } else {
    activeRow++;
  }

  activeRowId = `#foursRow${activeRow}`;
  $('#operatorTiles').before(rowGenerator(activeRow));
  attachDragDropEventListeners();
  attachSkipButtonListeners();
}

function updateRowValue(newRowNum = null) {

  if(newRowNum) {
    activeRow = newRowNum
  } else {
    activeRow++;
  }

  var targetRow = document.querySelector('.foursRowContainer:not(.disabled)');
  var oldResultDiv = targetRow.querySelector('.foursRow > .result');
  var newResultDiv = genRequiredResultDiv("result", activeRow);

var equalsDiv = targetRow.querySelector('div[data-value="="]');
  // Remove active row's result node
  oldResultDiv.parentNode.removeChild(oldResultDiv);
  // Add newly generated result div after the equals div
  //// equalsDiv.after(newResultDiv);
  equalsDiv.insertAdjacentHTML( 'afterend', newResultDiv );
  console.log(document.querySelector('.foursRowContainer:not(.disabled) .skipToNumButton'));
  document.querySelector('.foursRowContainer:not(.disabled) .skipToNumInput').value = activeRow + 1;


}

function rowGenerator(activeRow) {
// "&#8631;"
// "&#8677;"

  newRowHTML = `<div class="foursRowContainer">` +

    // `<div class="skipButtons"> ${genSkipOneButton("+1")} ${genSkipToNumButton("Skip To")} </div>` + 
    `<div class="skipButtons"> ${genSkipToNumButton("Skip To")} </div>` + 

    '<div class="foursRow noResult">' + 

    `${genDropZoneDiv("dropZone1")} ${genFourDiv("four1")} ${genDropZoneDiv("dropZone2")} ${genFourDiv("four2")} ${genDropZoneDiv("dropZone3")} ${genFourDiv("four3")} ${genDropZoneDiv("dropZone4")} ${genFourDiv("four4")} ${genDropZoneDiv("dropZone5")}` +

    `${genEqualsDiv("equalsNotEquals")} ${genRequiredResultDiv("result", activeRow)}` +

    `</div>` +
    
    '</div>';

  return newRowHTML;

  function genSkipOneButton(utf8Code) {
    return `<div class="skipButtonsElement"><button class="skipOneButton">${utf8Code}</button></div>`;
  }

  function genSkipToNumButton(utf8Code) {
    var textInputVal = parseInt(activeRow) + parseInt(1);
    return `<div class="skipButtonsElement">` + 
      `<button class="skipToNumButton">${utf8Code}</button>` + 
      `<form><input id="jumpToNum${activeRow}" class="skipToNumInput" name="jumpToNum${activeRow}" value="${textInputVal}" /></form>` + 
    `</div>`;
  }

  function genFourDiv(gridPositionClass) {
    return `<div class="staticSymbol four ${gridPositionClass}" data-value-default='4' data-value-negative='(0-4)' data-value="4"></div>`;
  }

  function genDropZoneDiv(gridPositionClass) {
    return `<div class="dropZone ${gridPositionClass}"></div>`;
  }

  function genEqualsDiv(gridPositionClass) {
    return `<div id="equalsOrEqualsNot${activeRow}" class="staticSymbol equalsNot ${gridPositionClass}" data-value="="></div>`;
  }

}

function genRequiredResultDiv(gridPositionClass, activeRow) {
  var requiredResultHTML;
  var requiredResultInnerDivsHTML = '';
  var numDigitsInRequiredResult;

  numDigitsInRequiredResult = activeRow.toString().length;

  requiredResultHTML = `<div class="staticSymbol ${gridPositionClass}" data-value="${activeRow}">`   // id="requiredResult" 

  for (var i = 0; i < numDigitsInRequiredResult; i++) {
    var digitToDisplay_string;
    var digitToDisplay_className;
    digitToDisplay_string = activeRow.toString().substring(i, i+1);

    switch (digitToDisplay_string) {
      case "0":
        digitToDisplay_className = "zero";
        break;
      case "1":
        digitToDisplay_className = "one";
        break;
      case "2":
        digitToDisplay_className = "two";
        break;
      case "3":
        digitToDisplay_className = "three";
        break;
      case "4":
        digitToDisplay_className = "four";
        break;
      case "5":
        digitToDisplay_className = "five";
        break;
      case "6":
        digitToDisplay_className = "six";
        break;
      case "7":
        digitToDisplay_className = "seven";
        break;
      case "8":
        digitToDisplay_className = "eight";
        break;
      case "9":
        digitToDisplay_className = "nine";
        break;
    }
    // console.log(requiredResultHTML);

    requiredResultInnerDivsHTML += `<div class="resultDigit ${digitToDisplay_className}"> </div>`
    // console.log(requiredResultInnerDivsHTML);

  }

  requiredResultHTML += requiredResultInnerDivsHTML + '</div>';
  // console.log(requiredResultHTML);
  return requiredResultHTML;

}

// div Appenders

function genTileToDrop(operatorTypeToInsert, tileValue) {
  var newTile;
  newTile = document.createElement('div')
  newTile.classList.add(operatorTypeToInsert, "droppedTile");
  newTile.setAttribute('draggable', 'true');
  newTile.setAttribute('data-operator', operatorTypeToInsert);
  newTile.setAttribute('data-value', tileValue);
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
  // console.log(lhs);
  // Split out each character
  lhs = lhs.split('');
  // console.log(lhs);

  lhs.forEach(function(char, i) {
    // console.log(`Token: ${char}`);

    // 'B' is a break character to prevent evaluation
    if (char === "B") {
      // console.log('in char === "B" condition');

      result.push(new Token('Break', 'B'));

    } else if (isDigit(char)) {
      // console.log('char is digit');

      if (prevCharRightParens) {
        // console.log('PUSH A MULTIPLICATION');

        result.push(new Token('Operator', '*'));
        prevCharRightParens = false;
      }
      numBuffer.push(char);
      prevCharRightParens = false;

    } else if (char === ".") {
      if (prevCharRightParens) {
        // console.log('PUSH A MULTIPLICATION');

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
        // console.log('PUSH A MULTIPLICATION');
        result.push(new Token('Operator', '*'));
      } else if (prevCharRightParens) {
        // console.log('PUSH A MULTIPLICATION');
        result.push(new Token('Operator', '*'));
        prevCharRightParens = false;
      }
      result.push(new Token('LeftParens', char));

    } else if (isRightParens(char)) {
      // console.log(`token is right parens`);
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

  if (numBuffer.length > 0) {
    emptyNumBufferAsLiteral();
  }

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
  return /\+|-|\*|\/|\^/.test(ch);
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

function clickPositionToConsole(ev, el) {
  console.log(`Click x-coord: ${ev.clientX}`);
}
