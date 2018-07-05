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
  console.log(`running 'handleDrop'...`);

  if (e.stopPropagation) {
    e.stopPropagation();
  }

  var isCorrect;
  console.log(this);
  if (dragSourceElement != this && tileType.includes(this.dataset.operatorAccepted)) {
    this.innerHTML = e.originalEvent.dataTransfer.getData('text/html');
    $(this).removeClass('over').addClass('dropped');
  }
  tileType = null;

  isCorrect = evalExpression();

  return false;
}

function resetDropZone() {
  $(this).html('').removeClass('dropped');
  evalExpression();
}

function evalExpression() {
  console.log(`running 'evalExpression'...activeRowId: ${activeRowId}`);

  var lhs = '';
  var lhsEvaluated = null;
  var requiredResult = null;
  var isCorrect = null;

  $(activeRowId).children("div").each(function(index, el) {
    // expression += el.innerHTML;
    lhs += el.innerHTML;
  });
  lhs = lhs.substring(0, lhs.indexOf("="));
  console.log(lhs);
  try {
    lhsEvaluated = new Function('"use strict";return (' + lhs + ')')();
    $('#expression').text(lhs);
    $('#evalResult').text(lhsEvaluated);

    requiredResult = $(activeRowId).children('#requiredResult').data('value');
    console.log(`Required result: ${requiredResult}`);
    isCorrect = lhsEvaluated === requiredResult;

    if (isCorrect === true) {
      $(activeRowId).removeClass('noResult wrongResult horizontal').addClass('rightResult tada');
      insertRow();
    } else if (isCorrect === false) {
      $(activeRowId).removeClass('noResult rightResult tada wrongResult horizontal').addClass('wrongResult horizontal');
    }

    return isCorrect;
  } catch (error) {
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
}

function playButtonClick() {
  insertRow();
  $(this).hide();
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

function rowGenerator() {

  newRowHTML = `  <div id="foursRow${activeRow}" class="row foursRow noResult"> \
      <div class="dropZone smallSquare" data-operator-accepted="binary" data-value=""></div> \
      <div class="dropZone tallRectangle" data-operator-accepted="parensOpen" data-value=""></div> \

      <div class="staticSymbol" data-value="4"> \
        4 \
      </div> \

      <div class="dropZone smallSquare" data-operator-accepted="binary" data-value=""></div> \
      <div class="dropZone tallRectangle" data-operator-accepted="parensOpen" data-value=""></div> \


      <div class="staticSymbol" data-value="4"> \
        4 \
      </div> \

      <div class="dropZone tallRectangle" data-operator-accepted="parens" data-value=""></div> \
      <div class="dropZone tallRectangle" data-operator-accepted="parens" data-value=""></div> \
      <div class="dropZone smallSquare" data-operator-accepted="binary" data-value=""></div> \
      <div class="dropZone tallRectangle" data-operator-accepted="parens" data-value=""></div> \

      <div class="staticSymbol" data-value="4"> \
        4 \
      </div> \

      <div class="dropZone tallRectangle" data-operator-accepted="parens" data-value=""></div> \
      <div class="dropZone smallSquare" data-operator-accepted="binary" data-value=""></div> \

      <div class="staticSymbol" data-value="4"> \
        4 \
      </div> \
      <div class="dropZone tallRectangle" data-operator-accepted="parensClose" data-value=""></div> \


      <div class="staticSymbol" data-value="="> \
        = \
      </div> \

      <div id="requiredResult" class="staticSymbol" data-value="${activeRow}"> \
        ${activeRow} \
      </div> \

    </div>`

  return newRowHTML;

}
