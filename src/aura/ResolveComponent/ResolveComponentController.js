({
    onInit: function (component, event, helper) {
        component.lax
            .enqueue('c.getParentValue')
            .then(parentValue => {
                // do computation logic...
                return Promise.resolve('prefix - ' + parentValue);
            })
            .then(result => {
                component.set('v.resolvedValue', result);
            })
    }
});