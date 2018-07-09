// To Do:
/// operatorTiles grid not working?
/// remove Bootstrap?


var activeRow = 0;
var activeRowId = "#foursRow0";

var dragSourceElement = null;
var tileType = null;
var tileValue = null;


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

function resetDropZone() {
  $(this).html('').removeClass('dropped plus minus multiply divide parensOpen parensClose squared sqrt');
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

function evalExpression() {
  // console.log(`running 'evalExpression'...activeRowId: ${activeRowId}`);

  var lhs = '';
  var lhsinnerHTML = '';
  var lhsdatasetValue = '';
  var lhsEvaluated = null;
  var requiredResult = null;
  var isCorrect = null;

  $(activeRowId).children("div").each(function(index, el) {
    // lhs += el.innerHTML;
    // lhs += el.dataset.value;
    lhsinnerHTML += el.innerHTML;
    lhsdatasetValue += el.dataset.value;
    // console.log(lhsdatasetValue);
    // console.log(el.dataset.value);
    // console.log(el.innerHTML);
  });
  lhs = lhsdatasetValue.replace(/\s/g,'');
  // console.log(`First Char: ${lhs.charAt(0)}`);
  // if(lhs.charAt(0) === "+") {
  //   lhs = lhs.substring(1,lhs.length);
  // }

  lhs = lhs.substring(0, lhs.indexOf("="));
  // console.log(lhs);
  tokenize(lhs);
  try {
    lhsEvaluated = new Function('"use strict";return (' + lhs + ')')();
    $('#expression').text(lhs);
    $('#evalResult').text(lhsEvaluated);

    isCorrect = lhsEvaluated === activeRow;

    if (isCorrect === true) {
      $(activeRowId).removeClass('noResult wrongResult horizontal').addClass('rightResult tada');
      $(activeRowId).children().css('border-style', 'none');
      insertRow();
    } else if (isCorrect === false) {
      $(activeRowId).removeClass('noResult rightResult tada wrongResult horizontal').addClass('wrongResult horizontal');
    }
    return isCorrect;

  } catch (error) {
    console.log(error.message);
    $('#expression').text(lhs);
    $(activeRowId).removeClass('rightResult tada wrongResult horizontal').addClass('noResult');
    return undefined;

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
  $('.dropZone').on('drop', handleDrop);

  $('.dropZone').on('click', resetDropZone);
  $('.four').on('click', negateFourByClick);
}

function playButtonClick() {
  insertRow();
  $(this).hide();
  $('#operatorTiles').show();
}

$(document).ready(function() {

  $('#startButton').on('click', playButtonClick);
  // $('#buttonEval').on('click', evalExpression);
  // $('#buttonReset').on('click', resetRow);

  attachDragDropEventListeners()

})

function insertRow() {
  $(activeRowId).addClass('disabled');
  activeRow++;
  activeRowId = `#foursRow${activeRow}`;
  $('#operatorTiles').before(rowGenerator());
  attachDragDropEventListeners();
}

function genFourDiv(gridPositionClass) {
  return `<div class="staticSymbol four ${gridPositionClass}" data-value-default="(4" data-value-negative="(-4" data-value="(4"></div>`;
}

function genBinaryOperatorDiv(gridPositionClass) {
  return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="binary" data-default-value=" " data-value=" "></div>`;
}

function genParensDiv(parensTypeAccepted, gridPositionClass) {
  return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="${parensTypeAccepted}" data-default-value=" " data-value=" "></div>`;
}

function genExpDiv(gridPositionClass) {
  return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="exponent" data-default-value="**1)" data-value="**1)"></div>`;
}

function genEqualsDiv(gridPositionClass) {
  return `<div class="staticSymbol equals ${gridPositionClass}" data-value="="></div>`;
}

function genRequiredResultDiv(gridPositionClass) {
  return `<div id="requiredResult" class="staticSymbol ${gridPositionClass}" data-value="${activeRow}"> ${activeRow} </div>`;
}

function rowGenerator() {

  newRowHTML = `  <div id="foursRow${activeRow}" class="row foursRow noResult"> ` +

      `${genParensDiv("parensOpen", "p1")} ${genFourDiv("four1")} ${genExpDiv("e1")}` +

      `${genBinaryOperatorDiv("b1")} ${genParensDiv("parensOpen", "p2")} ${genFourDiv("four2")} ${genExpDiv("e2")} ${genParensDiv("parensClose", "p3")}` +

      `${genBinaryOperatorDiv("b2")} ${genParensDiv("parensOpen", "p4")} ${genFourDiv("four3")} ${genExpDiv("e3")} ${genParensDiv("parensClose", "p5")}` +

      `${genBinaryOperatorDiv("b3")}                                     ${genFourDiv("four4")} ${genExpDiv("e4")} ${genParensDiv("parensClose", "p6")}` +

      `${genEqualsDiv("equals")} ${genRequiredResultDiv("result")}` +

    `</div>`

  return newRowHTML;

}

// Tokenizing

function createToken(type, value) {
    this.type = type;
    this.value = value;
}

function tokenize(lhs) {
  var result = [];

  // Remove whitespaces
  lhs.replace(/\s+/g, "");

  lhs = lhs.split('');
  lhs.forEach(function(char, i) {
    console.log(char);
  });
  // console.log(typeof(lhs[1]));
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
