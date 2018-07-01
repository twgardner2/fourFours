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
  console.log(tileType);
  if(tileType === this.dataset.operatorAccepted) {
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

  if (dragSourceElement != this && this.dataset.operatorAccepted === tileType) {
    this.innerHTML = e.originalEvent.dataTransfer.getData('text/html');
    console.log(e.originalEvent.dataTransfer.getData('operatorType'));
  }
  tileType = null;
  return false;
}



$(document).ready(function() {
  // $(".dragColumn").css("background-color", "yellow");
  //$('.dragColumn').on('dragstart', handleDragStart);

  $('.draggable').on('dragstart', handleDragStart);
  $('.draggable').on('dragend', handleDragEnd);
  $('.dropZone').on('dragover', handleDragOver);
  $('.dropZone').on('dragenter', handleDragEnter);
  $('.dropZone').on('dragleave', handleDragLeave);
  $('.dropZone').on('drop', handleDrop);

})
