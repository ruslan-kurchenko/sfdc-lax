({
  doInit: function (component, event, helper) {
    component.lax.lds('contactRecordCreator')
      .getNewRecord('Contact')
      .then(() => {
        const rec = component.get("v.newContact");
        const error = component.get("v.newContactError");

        if (error || (rec === null)) {
          console.log("Error initializing record template: " + error);
        }
      });
  },

  handleSaveContact: function (component, event, helper) {
    component.set("v.simpleNewContact.AccountId", '0010N000047Fj79QAC');

    const service = component.lax.lds('contactRecordCreator');
    service
      .saveRecord()
      .then(result => {
        var resultsToast = $A.get("e.force:showToast");
        resultsToast.setParams({
          "title": "Saved",
          "message": "The record was saved."
        });
        resultsToast.fire();
      })
      .error(e => {
        console.error(e);
      })
      .incomplete(e => {
        console.error(e);
        console.log("User is offline, device doesn't support drafts.");
      });
  }
});