({
  onInit: function onInit(component, event, helper) {
    const lax = component.lax;
    const single = component.find('single');
    const multiple = component.find('multiple');
    
    lax.createComponent('aura:text', { value: 'Single Component Creation' })
      .then(result => {
        single.set('v.body', result.component);
      })
      .catch(e => {
        console.log(e);
      });
    
    lax.createComponents([
        ['aura:text', { value: 'Multiple Component Creation #1'}],
        ['aura:text', { value: 'Multiple Component Creation #2'}],
        ['aura:text', { value: 'Multiple Component Creation #3'}]
      ])
      .then(result => {
        multiple.set('v.body', result.components);
      })
      .incomplete(e => {
        console.log(e);
      })
      .error(e => {
        console.log(e);
      });


    lax.createComponents([
        ['aura:text', { value: 'Success from error creation' }],
        ['lightning:datatable'],
        ['lightning:avatar'],
        ['lightning:fileCard'],
      ])
      .error(e => {
        console.log(e);
      });
  }
});