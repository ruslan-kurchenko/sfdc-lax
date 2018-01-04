({
    onInit: function (component, event, helper) {
        component.lax.enqueue('c.getContacts').then(function(contacts) {
            component.set('v.records', contacts);
        });
    }
});