var dragSourceElement = null;
var tileType = null;

function handleDragStart(e) {
  $(this).addClass('duringDrag').removeClass('draggable');

  dragSourceElement = this;
  e.originalEvent.dataTransfer.effectAllowed = 'move';
  e.originalEvent.dataTransfer.setData('text/html', this.innerHTML);
  e.originalEvent.dataTransfer.setData('operatorType', this.dataset.operatorType);
  tileType = this.dataset.operatorType;
}

function handleDragEnd() {
  $(this).addClass('draggable').removeClass('duringDrag');

}

function handleDragOver(e) {

  if (e.preventDefault) {
    e.preventDefault();
  }
  e.originalEvent.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  // console.log(tileType);
  if (tileType.includes(this.dataset.operatorAccepted)) {
    $(this).addClass('over');
  }

}

function handleDragLeave() {
  // $(this).addClass('dropZone').removeClass('dragOver');
  $(this).removeClass('over');

}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (dragSourceElement != this && tileType.includes(this.dataset.operatorAccepted)) {
    this.innerHTML = e.originalEvent.dataTransfer.getData('text/html');
    $(this).removeClass('over').addClass('dropped');
    // console.log(e.originalEvent.dataTransfer.getData('operatorType'));
  }
  tileType = null;
  try {
    evalExpression();
  }
  catch(err) {
    return false;
  }
  return false;
}

function returnValue(lhs) {
  return Function('"use strict";return (' + lhs + ')')();
}

function evalExpression() {
  var expression = "";
  var lhs = null;
  var lhsEvaluated = null;

  $("#foursRow").children("div").each(function(index, el) {
    // console.log(el.innerHTML);
    expression += el.innerHTML;
  });
  console.log(expression);

  lhs = expression.substring(0, expression.indexOf("="));
  lhsEvaluated = new Function('"use strict";return (' + lhs + ')')();

  $('#expression').text(lhs);
  $('#evalResult').text(returnValue(lhsEvaluated));
}

function resetRow() {
  $('.dropZone').html('').removeClass('over');

}

$(document).ready(function() {

  $('#buttonEval').on('click', evalExpression);
  $('#buttonReset').on('click', resetRow);

  $('.draggable').on('dragstart', handleDragStart);
  $('.draggable').on('dragend', handleDragEnd);
  $('.dropZone').on('dragover', handleDragOver);
  $('.dropZone').on('dragenter', handleDragEnter);
  $('.dropZone').on('dragleave', handleDragLeave);
  $('.dropZone').on('drop', handleDrop);

})
