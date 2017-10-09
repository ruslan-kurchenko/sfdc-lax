({
    onInit: function (component, event, helper) {
        component.lax.enqueue('c.getContacts').then((contacts) => {
            component.set('v.records', contacts);
        });
    }
});