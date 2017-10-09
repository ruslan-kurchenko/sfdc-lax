({
    onInit: function (component, event, helper) {
        component.lax
            .enqueueAll([
                { name: 'c.getContacts' },
                { name: 'c.getAccounts' },
                { name: 'c.getOpportunities' }
            ])
            .then((results) => {
                // results:
                // [ [contacts], [accounts], [opportunities] ]

                const contacts = results[0];
                const accounts = results[1];
                const opportunities = results[2];

                component.set('v.contacts', contacts);
                component.set('v.accounts', accounts);
                component.set('v.opportunities', opportunities);
            })
    }
});