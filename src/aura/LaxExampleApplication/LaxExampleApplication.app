<aura:application extends="force:slds">
    <c:lax context="{!this}" onPrototypeInit="{!c.onLaxPrototypeInit}" />

    <div class="slds-grid--vertical slds-grid--align-space slds-grid--vertical-align-top">
        <c:ContactList />
        <c:ChainActionsComponent />
        <c:EnqueueAllComponent />
        <c:ResolveComponent />
        <c:ActionBuilderComponent />
        <c:ExceptionComponent />
        <c:PromiseFinallyComponent />
        <c:IncompleteComponent />
        <c:EventsHandlerComponent />
        <c:CreateCmpComponent />
    </div>
</aura:application>