({
  handleDeleteRecord: function (component, event, helper) {
    component.lax.lds('recordHandler')
      .deleteRecord()
      .then(result => {
        console.log(result);
      })
      .error(e => {
        console.error(e);
      })
      .incomplete(e => {
        console.error(e);
        console.log("User is offline, device doesn't support drafts.");
      })
  },

  /**
   * Control the component behavior here when record is changed (via any component)
   */
  handleRecordUpdated: function (component, event, helper) {
    var eventParams = event.getParams();
    if (eventParams.changeType === "CHANGED") {
      // record is changed
    } else if (eventParams.changeType === "LOADED") {
      // record is loaded in the cache
    } else if (eventParams.changeType === "REMOVED") {
      // record is deleted, show a toast UI message
      var resultsToast = $A.get("e.force:showToast");
      resultsToast.setParams({
        "title": "Deleted",
        "message": "The record was deleted."
      });
      resultsToast.fire();

    } else if (eventParams.changeType === "ERROR") {
      // there’s an error while loading, saving, or deleting the record
    }
  }
})