var activeRowId = "#foursRow1";


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

// function handleDrop(e) {
//   if (e.stopPropagation) {
//     e.stopPropagation();
//   }
//
//   var requiredResult;
//   var isCorrect;
//
//   requiredResult = $('#requiredResult').data('value');
//
//   if (dragSourceElement != this && tileType.includes(this.dataset.operatorAccepted)) {
//     this.innerHTML = e.originalEvent.dataTransfer.getData('text/html');
//     $(this).removeClass('over').addClass('dropped');
//   }
//   tileType = null;
//   try {
//     isCorrect = evalExpression(requiredResult);
//     if(isCorrect) {
//       $('#foursRow').removeClass('noResult wrongResult').addClass('rightResult');
//     } else {
//       $('#foursRow').removeClass('noResult rightResult').addClass('wrongResult');
//     }
//   }
//   catch(err) {
//     $('#foursRow').removeClass('wrongResult').removeClass('rightResult');
//     return false;
//   }
//   return false;
// }

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  var isCorrect;

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

// function evalExpression(requiredResult) {
//   var expression = "";
//   var lhs = null;
//   var lhsEvaluated = null;
//   var isCorrect = null;
//
//   $("#foursRow").children("div").each(function(index, el) {
//     // console.log(el.innerHTML);
//     expression += el.innerHTML;
//   });
//   // console.log(expression);
//
//   lhs = expression.substring(0, expression.indexOf("="));
//   lhsEvaluated = new Function('"use strict";return (' + lhs + ')')();
//
//   $('#expression').text(lhs);
//   // $('#evalResult').text(returnValue(lhsEvaluated));
//   $('#evalResult').text(lhsEvaluated);
//
//   isCorrect = lhsEvaluated === requiredResult;
//
//   return isCorrect;
// }

function evalExpression() {
  // var expression = "";
  var lhs = '';
  var lhsEvaluated = null;
  var requiredResult = null;
  var isCorrect = null;

  $(activeRowId).children("div").each(function(index, el) {
    // expression += el.innerHTML;
    lhs += el.innerHTML;
  });
  lhs = lhs.substring(0, lhs.indexOf("="));

  try {
    lhsEvaluated = new Function('"use strict";return (' + lhs + ')')();
    $('#expression').text(lhs);
    $('#evalResult').text(lhsEvaluated);

    requiredResult = $(activeRowId).children('#requiredResult').data('value');
    isCorrect = lhsEvaluated === requiredResult;

    if (isCorrect === true) {
      $(activeRowId).removeClass('noResult wrongResult horizontal').addClass('rightResult tada');
    } else if (isCorrect === false) {
      $(activeRowId).removeClass('noResult rightResult tada wrongResult horizontal').addClass('wrongResult horizontal');
    }

    return isCorrect;
  }
  catch(error) {
    $('#expression').text(lhs);
    $(activeRowId).removeClass('rightResult tada wrongResult horizontal').addClass('noResult');
    return undefined;

  }
}

function resetRow() {
  $('.dropZone').html('').removeClass('over').removeClass('dropped');
  $(activeRowId).removeClass('rightResult').removeClass('wrongResult');

}

$(document).ready(function() {

  $('#buttonEval').on('click', evalExpression);
  $('#buttonReset').on('click', resetRow);

  $('.dropZone').on('click', resetDropZone);


  $('.draggable').on('dragstart', handleDragStart);
  $('.draggable').on('dragend', handleDragEnd);
  $('.dropZone').on('dragover', handleDragOver);
  $('.dropZone').on('dragenter', handleDragEnter);
  $('.dropZone').on('dragleave', handleDragLeave);
  $('.dropZone').on('drop', handleDrop);

})

// function rowGenerator
