// To Do:
/// Change dropZone display to an image
/// Use only grid system from Bootstrap?
/// Fix dropZone reset function


var activeRow = 0;
var activeRowId = "#foursRow0";

var dragSourceElement = null;
var tileType = null;


function handleDragStart(e) {
  // console.log(`running 'handleDragStart'...`);
  $(this).addClass('duringDrag').removeClass('draggable');

  dragSourceElement = this;
  e.originalEvent.dataTransfer.effectAllowed = 'move';
  e.originalEvent.dataTransfer.setData('text/html', this.innerHTML);
  e.originalEvent.dataTransfer.setData('text/plain', this.dataset.value);

  e.originalEvent.dataTransfer.setData('operatorType', this.dataset.operatorType);
  tileType = this.dataset.operatorType;
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
    $(this).removeClass('over minus multiply divide').addClass('dropped plus');
  }
  tileType = null;

  isCorrect = evalExpression();

  return false;
}

function resetDropZone() {
  $(this).html('').removeClass('dropped');
  evalExpression();
}

function negateFourByClick() {
  if (this.innerHTML === "4") {
    this.innerHTML = "-4";
    this.dataset.value = "+(-4)"
  } else {
    this.innerHTML = "4";
    this.dataset.value = "4"
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
  console.log(`First Char: ${lhs.charAt(0)}`);
  if(lhs.charAt(0) === "+") {
    lhs = lhs.substring(1,lhs.length);
  }

  lhs = lhs.substring(0, lhs.indexOf("="));
  console.log(lhs);

  try {
    lhsEvaluated = new Function('"use strict";return (' + lhs + ')')();
    $('#expression').text(lhs);
    $('#evalResult').text(lhsEvaluated);

    isCorrect = lhsEvaluated === activeRow;

    if (isCorrect === true) {
      $(activeRowId).removeClass('noResult wrongResult horizontal').addClass('rightResult tada');
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
  $('.staticFour').on('click', negateFourByClick);
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
  return `<div class="staticSymbol staticFour ${gridPositionClass}" data-value="4"></div>`;
}

function genBinaryOperatorDiv(gridPositionClass) {
  return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="binary" data-defaultValue=" " data-value=" "></div>`;
}

function genParensDiv(parensTypeAccepted, gridPositionClass) {
  return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="${parensTypeAccepted}" data-value=" "></div>`;
}

function genExpDiv(gridPositionClass) {
  return `<div class="dropZone ${gridPositionClass}" data-operator-accepted="exponent" data-defaultValue="**1" data-value="**1"></div>`;
}

function genEqualsDiv(gridPositionClass) {
  return `<div class="staticSymbol equals ${gridPositionClass}" data-value="="></div>`;
}

function genRequiredResultDiv(gridPositionClass) {
  return `<div id="requiredResult" class="staticSymbol ${gridPositionClass}" data-value="${activeRow}"> ${activeRow} </div>`;
}



function rowGenerator() {

  // staticFour = `<div class="staticSymbol staticFour" data-value="4">4</div>`;
  // staticEquals = `<div class="staticSymbol" data-value="=">=</div>`;
  // equalsRequiredResult = `<div id="requiredResult" class="staticSymbol" data-value="=${activeRow}"> =${activeRow} </div>`
  // binaryOperator = `<div class="dropZone smallSquare" data-operator-accepted="binary" data-defaultValue=" " data-value=" "></div>`;
  // openOrCloseParens = `<div class="dropZone tallRectangle" data-operator-accepted="parens" data-value=" "></div>`;
  // openParens = `<div class="dropZone tallRectangle" data-operator-accepted="parensOpen" data-value=" "></div>`;
  // closeParens = `<div class="dropZone tallRectangle" data-operator-accepted="parensClose" data-value=""></div>`;
  // exponent = `<div class="dropZone exponentSquare" data-operator-accepted="exponent" data-defaultValue="**1" data-value="**1"></div>`;

  newRowHTML = `  <div id="foursRow${activeRow}" class="row foursRow noResult"> ` +

      // `${openParens} ${staticFour} ${exponent} ${binaryOperator} ` +
      `${genParensDiv("parensOpen", "p1")} ${genFourDiv("four1")} ${genExpDiv("e1")}` +

      `${genBinaryOperatorDiv("b1")} ${genParensDiv("parensOpen", "p2")} ${genFourDiv("four2")} ${genExpDiv("e2")} ${genParensDiv("parensClose", "p3")}` +

      `${genBinaryOperatorDiv("b2")} ${genParensDiv("parensOpen", "p4")} ${genFourDiv("four3")} ${genExpDiv("e3")} ${genParensDiv("parensClose", "p5")}` +

      `${genBinaryOperatorDiv("b3")}                                     ${genFourDiv("four4")} ${genExpDiv("e4")} ${genParensDiv("parensClose", "p6")}` +

      `${genEqualsDiv("equals")} ${genRequiredResultDiv("result")}` +

    `</div>`

  return newRowHTML;

}
