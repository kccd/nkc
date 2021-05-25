$(function() {
  const buttons = $(`button[data-type="disableColumn"], button[data-type="enableColumn"]`);
  for(let i = 0; i < buttons.length; i++) {
    const button = buttons.eq(i);
    button.on('click', function() {
      const disabled = button.attr('data-type') === 'disableColumn';
      const columnId = button.attr('data-column-id');
      managementColumn(columnId, 'column' ,disabled);
    });
  }
});