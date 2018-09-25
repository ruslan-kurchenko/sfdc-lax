({
  getValue: function(component) {
    return (async function() {
      const lax = component.lax;

      const parentValue = await lax.enqueue('c.getParentValue');
      const dependentValue = await lax.enqueue('c.getDependentValue', { parentValue: parentValue });

      return dependentValue;
    })();
  }
});