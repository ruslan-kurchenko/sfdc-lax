public class LaxExamplesController {

    @AuraEnabled
    public static List<Contact> getContacts() {
        return [
                SELECT Id, Name
                FROM Contact
                LIMIT 5
        ];
    }

    @AuraEnabled
    public static List<Account> getAccounts() {
        return [
                SELECT Id, Name
                FROM Account
                LIMIT 5
        ];
    }

    @AuraEnabled
    public static List<Opportunity> getOpportunities() {
        return [
                SELECT Id, Name
                FROM Opportunity
                LIMIT 5
        ];
    }

    @AuraEnabled
    public static String getParentValue() {
        return 'PARENT_VALUE';
    }

    @AuraEnabled
    public static String getDependentValue(String parentValue) {
        // use parent value somehow...
        return 'DEPENDENT_VALUE ' + parentValue;
    }

}