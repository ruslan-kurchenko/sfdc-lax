({
  handleSaveRecord: function (component, event, helper) {
    component.lax.lds('recordHandler')
      .saveRecord()
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
      // get the fields that changed for this record
      var changedFields = eventParams.changedFields;
      console.log('Fields that are changed: ' + JSON.stringify(changedFields));
      // record is changed, so refresh the component (or other component logic)
      var resultsToast = $A.get("e.force:showToast");
      resultsToast.setParams({
        "title": "Saved",
        "message": "The record was updated."
      });
      resultsToast.fire();

    } else if (eventParams.changeType === "LOADED") {
      // record is loaded in the cache
    } else if (eventParams.changeType === "REMOVED") {
      // record is deleted and removed from the cache
    } else if (eventParams.changeType === "ERROR") {
      // there’s an error while loading, saving or deleting the record
    }
  }
})