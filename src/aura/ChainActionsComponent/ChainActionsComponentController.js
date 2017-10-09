({
    onInit: function (component, event, helper) {
        component.lax
            .enqueue('c.getParentValue')
            .then((parentValue) => {
                component.set('v.parentValue', parentValue);
                return component.lax.enqueue('c.getDependentValue', { parentValue: parentValue });
            })
            .then((dependentValue) => {
                component.set('v.dependentValue', dependentValue);
            });
    }
});